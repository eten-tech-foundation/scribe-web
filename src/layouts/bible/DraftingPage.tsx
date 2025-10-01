import { useCallback, useEffect, useRef, useState } from 'react';

import { useMatch, useNavigate } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAddTranslatedVerse, useSubmitChapter } from '@/hooks/useBibleTarget';
import { useBibleTextDebounce } from '@/hooks/useBibleTextDebounce';
import { TargetPanel } from '@/layouts/bible/TargetPanel';
import { type ProjectItem, type User } from '@/lib/types';
import { useAppStore } from '@/store/store';

import { SourcePanel } from './SourcePanel';

export interface Source {
  id: number;
  verseNumber: number;
  text: string;
}

export interface TargetVerse {
  id?: number;
  content: string;
  verseNumber: number;
}

interface DraftingUIProps {
  projectItem: ProjectItem;
  sourceVerses: Source[];
  targetVerses: TargetVerse[];
  userdetail: User;
}

const DraftingUI: React.FC<DraftingUIProps> = ({
  projectItem,
  sourceVerses,
  targetVerses,
  userdetail,
}) => {
  const addVerseMutation = useAddTranslatedVerse();
  const submitChapterMutation = useSubmitChapter();
  const navigate = useNavigate();

  const [verses, setVerses] = useState<TargetVerse[]>(targetVerses);
  const [activeVerseId, setActiveVerseId] = useState(1);
  const [previousActiveVerseId, setPreviousActiveVerseId] = useState<number | null>(null);

  const sourceScrollRef = useRef<HTMLDivElement>(null);
  const targetScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingSyncRef = useRef(false);

  const saveVerse = useCallback(
    async (verse: number, text: string) => {
      const sourceVerse = sourceVerses.find((v: Source) => v.verseNumber === verse);
      const trimmedText = text.trim();

      await addVerseMutation.mutateAsync({
        verseData: {
          projectUnitId: projectItem.projectUnitId,
          content: trimmedText,
          bibleTextId: (sourceVerse as Source).id,
          assignedUserId: userdetail.id,
        },
        email: userdetail.email,
      });
    },
    [addVerseMutation, projectItem.projectUnitId, sourceVerses, userdetail]
  );

  const { debouncedSave, saveImmediately, getSaveStatus, setInitialContent } = useBibleTextDebounce(
    {
      onSave: saveVerse,
      debounceMs: 2000,
      retryDelayMs: 10000,
    }
  );

  useEffect(() => {
    if (targetVerses.length > 0) {
      targetVerses.forEach(verse => {
        setInitialContent(verse.verseNumber, verse.content);
      });

      const allVersesCompleted = sourceVerses.every(sourceVerse => {
        const targetVerse = targetVerses.find(tv => tv.verseNumber === sourceVerse.verseNumber);
        return targetVerse && targetVerse.content.trim() !== '';
      });

      if (allVersesCompleted) {
        setActiveVerseId(1);
      } else {
        // Find the most recently edited verse (last verse with content)
        let mostRecentlyEditedVerse = 1;

        for (let i = targetVerses.length - 1; i >= 0; i--) {
          if (targetVerses[i].content.trim() !== '') {
            mostRecentlyEditedVerse = targetVerses[i].verseNumber;
            break;
          }
        }

        // If no verses have content, find first empty verse
        if (mostRecentlyEditedVerse === 1 && targetVerses[0]?.content.trim() === '') {
          const firstEmpty = targetVerses.find(v => v.content.trim() === '');
          if (firstEmpty) {
            mostRecentlyEditedVerse = firstEmpty.verseNumber;
          }
        }
        setActiveVerseId(mostRecentlyEditedVerse);
      }
    }
  }, [targetVerses, sourceVerses, setInitialContent]);

  const totalSourceVerses = sourceVerses.length;
  const versesWithText = verses.filter(v => v.content.trim() !== '').length;
  const countWithContent = verses.filter(v => v.content && v.content.trim() !== '').length;
  const progressPercentage = (countWithContent / sourceVerses.length) * 100;
  const isTranslationComplete = versesWithText === totalSourceVerses;

  const isAnythingSaving = verses.some(v => {
    const status = getSaveStatus(v.verseNumber);
    return status.showLoader;
  });

  const hasAnyError = verses.some(v => {
    const status = getSaveStatus(v.verseNumber);
    return status.hasRetryScheduled;
  });

  const updateTargetVerse = (id: number, text: string) => {
    setVerses(currentVerses =>
      currentVerses.map(verse => (verse.verseNumber === id ? { ...verse, content: text } : verse))
    );
    debouncedSave(id, text);
  };

  const handleActiveVerseChange = async (newVerseId: number) => {
    if (previousActiveVerseId !== null && previousActiveVerseId !== newVerseId) {
      const previousVerse = verses.find(v => v.verseNumber === previousActiveVerseId);
      if (previousVerse) {
        const status = getSaveStatus(previousActiveVerseId);
        if (status.hasUnsavedChanges) {
          await saveImmediately(previousActiveVerseId, previousVerse.content);
        }
      }
    }

    setPreviousActiveVerseId(activeVerseId);
    setActiveVerseId(newVerseId);
  };

  const moveToNextVerse = useCallback(async () => {
    const currentVerse = verses.find(v => v.verseNumber === activeVerseId);
    if (!currentVerse || currentVerse.content.trim() === '') return;

    const nextVerseId = activeVerseId + 1;

    if (nextVerseId <= totalSourceVerses) {
      const nextVerseExists = verses.find(v => v.verseNumber === nextVerseId);

      if (!nextVerseExists) {
        setVerses(prev => [...prev, { verseNumber: nextVerseId, content: '' }]);
        setInitialContent(nextVerseId, '');
      }

      setPreviousActiveVerseId(activeVerseId);
      setActiveVerseId(nextVerseId);

      const status = getSaveStatus(activeVerseId);
      if (status.hasUnsavedChanges) {
        await saveImmediately(activeVerseId, currentVerse.content);
      }
    }
  }, [activeVerseId, verses, totalSourceVerses, saveImmediately, setInitialContent, getSaveStatus]);

  const handleScroll = (source: 'source' | 'target', scrollTop: number) => {
    if (isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;

    if (source === 'source' && targetScrollRef.current) {
      targetScrollRef.current.scrollTop = scrollTop;
    } else if (source === 'target' && sourceScrollRef.current) {
      sourceScrollRef.current.scrollTop = scrollTop;
    }

    setTimeout(() => {
      isScrollingSyncRef.current = false;
    }, 50);
  };

  const handleSubmit = async () => {
    if (isTranslationComplete) {
      const savePromises = verses
        .filter(verse => {
          const status = getSaveStatus(verse.verseNumber);
          return status.hasUnsavedChanges;
        })
        .map(verse => saveImmediately(verse.verseNumber, verse.content));

      await Promise.all(savePromises);

      await submitChapterMutation.mutateAsync({
        chapterAssignmentId: projectItem.chapterAssignmentId,
        email: userdetail.email,
      });
      await navigate({ to: '/' });
    }
  };

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='flex-shrink-0'>
        <div className='flex items-center justify-between px-6 py-4'>
          <div className='flex-shrink-0'>
            <h2 className='text-3xl font-bold text-gray-900'>
              {projectItem.book} {projectItem.chapterNumber}
            </h2>
          </div>
          <div className='flex flex-1 items-center justify-end gap-4'>
            <div className='flex items-center gap-2'>
              {isAnythingSaving && (
                <Loader className='h-4 w-4 animate-spin text-[var(--primary)]' />
              )}
              {hasAnyError && <span className='text-sm text-red-500'>Auto-save failed</span>}
            </div>
            <div className='bg-input rounded-lg border md:w-50 lg:w-76 xl:w-105'>
              <div className='h-4 overflow-hidden rounded-full'>
                <div
                  className='bg-primary h-full rounded-full transition-all duration-300'
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <Button
              className={`flex-shrink-0 px-6 py-2 font-medium transition-all ${
                isTranslationComplete
                  ? 'bg-primary hover:bg-primary-hover cursor-pointer text-white'
                  : 'cursor-not-allowed bg-gray-300 text-gray-500'
              }`}
              disabled={!isTranslationComplete}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-hidden'>
        <div className='flex h-full'>
          <div className='w-1/2'>
            <SourcePanel
              activeVerseId={activeVerseId}
              bibleName={projectItem.bibleName}
              scrollRef={sourceScrollRef}
              verses={sourceVerses}
              onScroll={scrollTop => handleScroll('source', scrollTop)}
            />
          </div>
          <div className='w-1/2'>
            <TargetPanel
              activeVerseId={activeVerseId}
              moveToNextVerse={moveToNextVerse}
              scrollRef={targetScrollRef}
              setActiveVerseId={handleActiveVerseChange}
              setVerses={setVerses}
              targetLanguage={projectItem.targetLanguage}
              totalSourceVerses={totalSourceVerses}
              updateVerse={updateTargetVerse}
              verses={verses}
              onScroll={scrollTop => handleScroll('target', scrollTop)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const DraftingPage: React.FC = () => {
  const { userdetail } = useAppStore();
  const { loaderData } = useMatch({
    from: '/translation/$bookId/$chapterNumber',
  });

  if (!loaderData || !userdetail) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <DraftingUI
      projectItem={loaderData.projectItem}
      sourceVerses={loaderData.sourceVerses}
      targetVerses={loaderData.targetVerses}
      userdetail={userdetail}
    />
  );
};

export default DraftingPage;
