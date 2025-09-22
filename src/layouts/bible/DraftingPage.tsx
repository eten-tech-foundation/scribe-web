import { useCallback, useRef, useState } from 'react';

import { useMatch, useNavigate } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

import { useAddTranslatedVerse, useSubmitChapter } from '@/hooks/useBibleTarget';
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
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveError, setAutoSaveError] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null);
  const [previousActiveVerseId, setPreviousActiveVerseId] = useState<number | null>(null);

  const sourceScrollRef = useRef<HTMLDivElement>(null);
  const targetScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingSyncRef = useRef(false);

  const totalSourceVerses = sourceVerses.length;
  const versesWithText = verses.filter(v => v.content.trim() !== '').length;
  const countWithContent = verses.filter(v => v.content && v.content.trim() !== '').length;
  const progressPercentage = (countWithContent / sourceVerses.length) * 100;
  const isTranslationComplete = versesWithText === totalSourceVerses;

  const saveVerse = useCallback(
    async (verse: number, text: string) => {
      const sourceVerse = sourceVerses.find((v: Source) => v.verseNumber === verse);

      if (!sourceVerse) {
        console.error(`Source verse ${verse} not found.`);
        return;
      }

      const trimmedText = text.trim();

      await addVerseMutation.mutateAsync({
        verseData: {
          projectUnitId: projectItem.projectUnitId,
          content: trimmedText,
          bibleTextId: sourceVerse.id,
          assignedUserId: userdetail.id,
        },
        email: userdetail.email,
      });
    },
    [addVerseMutation, projectItem.projectUnitId, sourceVerses, userdetail]
  );

  const saveVerseImmediately = useCallback(
    async (verseId: number, text: string) => {
      setIsAutoSaving(true);
      setAutoSaveError(false);

      try {
        await saveVerse(verseId, text);
        setIsAutoSaving(false);
      } catch {
        setIsAutoSaving(false);
        setAutoSaveError(true);
      }
    },
    [saveVerse]
  );

  const autoSave = useCallback(
    async (verseId: number, text: string) => {
      setIsAutoSaving(true);
      setAutoSaveError(false);

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsAutoSaving(false);
        await saveVerse(verseId, text);
      } catch {
        setIsAutoSaving(false);
        setAutoSaveError(true);
        const retry = setTimeout(() => {
          void autoSave(verseId, text);
        }, 10000);
        setRetryTimeout(retry);
      }
    },
    [saveVerse]
  );

  const updateTargetVerse = (id: number, text: string) => {
    if (saveTimeout) clearTimeout(saveTimeout);
    if (retryTimeout) clearTimeout(retryTimeout);

    setVerses(currentVerses =>
      currentVerses.map(verse => (verse.verseNumber === id ? { ...verse, content: text } : verse))
    );

    const timeout = setTimeout(() => {
      void autoSave(id, text);
    }, 2000);
    setSaveTimeout(timeout);
  };

  const handleActiveVerseChange = async (newVerseId: number) => {
    if (previousActiveVerseId !== null && previousActiveVerseId !== newVerseId) {
      const previousVerse = verses.find(v => v.verseNumber === previousActiveVerseId);
      if (previousVerse) {
        if (saveTimeout) clearTimeout(saveTimeout);
        await saveVerseImmediately(previousActiveVerseId, previousVerse.content);
      }
    }

    setPreviousActiveVerseId(activeVerseId);
    setActiveVerseId(newVerseId);
  };

  const moveToNextVerse = async () => {
    const currentVerse = verses.find(v => v.verseNumber === activeVerseId);
    if (!currentVerse || currentVerse.content.trim() === '') return;

    await saveVerseImmediately(activeVerseId, currentVerse.content);

    const nextVerseId = activeVerseId + 1;

    if (nextVerseId <= totalSourceVerses) {
      const nextVerseExists = verses.find(v => v.verseNumber === nextVerseId);

      if (!nextVerseExists) {
        setVerses(prev => [...prev, { verseNumber: nextVerseId, content: '' }]);
      }

      setPreviousActiveVerseId(activeVerseId);
      setActiveVerseId(nextVerseId);
    }
  };

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
      const currentVerse = verses.find(v => v.verseNumber === activeVerseId);
      if (currentVerse) {
        await saveVerseImmediately(activeVerseId, currentVerse.content);
      }

      // Save all other verses that might have pending changes (will be trimmed)
      const savePromises = verses.map(verse =>
        saveVerseImmediately(verse.verseNumber, verse.content)
      );

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
          <div>
            <h2 className='text-3xl font-bold text-gray-900'>
              {projectItem.book} {projectItem.chapterNumber}
            </h2>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              {isAutoSaving && <Loader className='h-4 w-4 animate-spin text-gray-500' />}
              {autoSaveError && <span className='text-sm text-red-500'>Auto-save failed</span>}
            </div>
            <div className='bg-input w-96 rounded-lg border'>
              <div className='h-2 overflow-hidden rounded-full'>
                <div
                  className='h-full rounded-full bg-cyan-600 transition-all duration-300'
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <button
              className={`rounded px-6 py-2 font-medium transition-all ${
                isTranslationComplete
                  ? 'cursor-pointer bg-cyan-600 text-white hover:bg-cyan-700'
                  : 'cursor-not-allowed bg-gray-300 text-gray-500'
              }`}
              disabled={!isTranslationComplete}
              onClick={handleSubmit}
            >
              Submit
            </button>
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
    return <Loader />;
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
