import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useMatch, useNavigate } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAddTranslatedVerse, useSubmitChapter } from '@/hooks/useBibleTarget';
import { useBibleTextDebounce } from '@/hooks/useBibleTextDebounce';
import { type ProjectItem, type User } from '@/lib/types';
import { useAppStore } from '@/store/store';

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
  const [textareaHeights, setTextareaHeights] = useState<Record<number, number>>({});

  const targetScrollRef = useRef<HTMLDivElement>(null);

  const textareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [buttonTop, setButtonTop] = useState<number>(0);

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

  const handleHeightChange = (verseId: number, height: number) => {
    setTextareaHeights(prev => {
      const currentHeight = prev[verseId] || 0;
      const newHeight = Math.max(currentHeight, height);
      if (newHeight !== currentHeight) {
        return { ...prev, [verseId]: newHeight };
      }
      return prev;
    });
  };

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
        if (mostRecentlyEditedVerse > 1) {
          const verseDiv = verseRefs.current[mostRecentlyEditedVerse];
          if (verseDiv) {
            verseDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    }
  }, [targetVerses, sourceVerses, setInitialContent]);

  useEffect(() => {
    if (verses.length === 0) {
      setVerses([
        {
          verseNumber: 1,
          content: '',
        },
      ]);
    } else {
      verses.forEach(verse => {
        const textarea = textareaRefs.current[verse.verseNumber];
        if (textarea && verse.content) {
          autoResizeTextarea(textarea);
        }
      });
    }
  }, [setVerses, verses]);

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(20, textarea.scrollHeight) + 'px';
  };

  const updateButtonPosition = useCallback(() => {
    const container = targetScrollRef.current;
    const textarea = textareaRefs.current[activeVerseId];
    if (!container || !textarea) return;

    const containerRect = container.getBoundingClientRect();
    const textareaRect = textarea.getBoundingClientRect();
    const top = container.scrollTop + (textareaRect.bottom - containerRect.top) + 20; // 20px gap
    setButtonTop(top);
  }, [activeVerseId]);

  useLayoutEffect(() => {
    // Focus and position updates after DOM mutations, before paint
    const textarea = textareaRefs.current[activeVerseId];
    if (textarea) {
      textarea.focus();
      const len = textarea.value.length;
      try {
        textarea.setSelectionRange(len, len);
      } catch {}
      autoResizeTextarea(textarea);
    }
    updateButtonPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVerseId, verses]);

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

  const handleTextChange = (verseId: number, text: string) => {
    updateTargetVerse(verseId, text);

    const textarea = textareaRefs.current[verseId];
    if (textarea) {
      autoResizeTextarea(textarea);
    }
    updateButtonPosition();
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
      // useLayoutEffect will focus and reposition after state updates
    }
  }, [activeVerseId, verses, totalSourceVerses, saveImmediately, setInitialContent, getSaveStatus]);

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

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await moveToNextVerse();
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

      <div className='mx-auto max-w-5xl flex-1 overflow-hidden'>
        <div className='grid h-full grid-cols-2' style={{ gridTemplateRows: '4rem 1fr' }}>
          <div className='bg-background sticky top-0 z-10 ml-8 px-6 py-4'>
            <h3 className='text-xl font-bold text-gray-800'>IRV Gujarati</h3>
          </div>
          <div className='bg-background sticky top-0 z-10 py-4'>
            <h3 className='text-xl font-bold text-gray-800'>Gujarati</h3>
          </div>

          <div
            ref={targetScrollRef}
            className='relative col-span-2 flex h-full flex-col overflow-y-auto'
            onScroll={() => updateButtonPosition()}
          >
            {sourceVerses.map(verse => {
              const isActive = activeVerseId === verse.verseNumber;
              const currentTargetVerse = verses.find(v => v.verseNumber === verse.verseNumber);
              const hasContent = !!currentTargetVerse?.content.trim();
              return (
                <div
                  key={verse.verseNumber}
                  ref={el => (verseRefs.current[verse.verseNumber] = el)}
                  className='grid grid-cols-2 gap-4 px-6 py-4'
                >
                  {/* source verse */}
                  <div
                    className='col-1 flex cursor-pointer items-start transition-all'
                    onClick={() => handleActiveVerseChange(verse.verseNumber)}
                  >
                    <div className='w-8 flex-shrink-0'>
                      <span className='text-lg font-medium text-gray-700'>{verse.verseNumber}</span>
                    </div>
                    <div className='flex-1'>
                      <div
                        className={`bg-card rounded-lg border border-2 px-4 py-1 shadow-sm transition-all ${isActive ? 'border-primary' : ''}`}
                      >
                        <p className='min-h-12 content-center overflow-hidden text-base leading-relaxed leading-snug text-gray-800 outline-none'>
                          {verse.text}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* target verse */}
                  <div
                    className={`col-2 flex transition-all ${isActive || hasContent ? '' : 'hidden'}`}
                  >
                    <div
                      className={`flex-1 cursor-pointer rounded-lg border border-2 px-4 py-1 shadow-sm transition-all ${isActive ? 'border-primary' : ''}`}
                      onClick={() => handleActiveVerseChange(verse.verseNumber)}
                    >
                      <textarea
                        ref={el => (textareaRefs.current[verse.verseNumber] = el)}
                        className='h-auto min-h-3 w-full resize-none content-center overflow-hidden border-none bg-transparent text-base leading-relaxed leading-snug text-gray-800 outline-none'
                        placeholder='Enter translation...'
                        value={currentTargetVerse?.content ?? ''}
                        onChange={e => handleTextChange(verse.verseNumber, e.target.value)}
                        onFocus={() => handleActiveVerseChange(verse.verseNumber)}
                        onKeyDown={e => handleKeyDown(e)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {activeVerseId < totalSourceVerses && (
              <div className='absolute right-4 z-10' style={{ top: buttonTop }}>
                <Button
                  className={`bg-primary flex items-center gap-2 px-6 py-2 font-medium shadow-lg transition-all ${
                    verses.find(v => v.verseNumber === activeVerseId)?.content.trim()
                      ? 'hover:bg-primary-hover cursor-pointer text-white'
                      : 'cursor-not-allowed bg-gray-300 text-gray-500'
                  }`}
                  disabled={!verses.find(v => v.verseNumber === activeVerseId)?.content.trim()}
                  title='Enter'
                  onClick={() => moveToNextVerse()}
                >
                  Next Verse
                </Button>
              </div>
            )}
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
