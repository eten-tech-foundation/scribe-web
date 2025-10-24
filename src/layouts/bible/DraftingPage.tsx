import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useMatch, useNavigate } from '@tanstack/react-router';
import { ChevronLeft, Loader } from 'lucide-react';

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
  readOnly?: boolean;
}

const DraftingUI: React.FC<DraftingUIProps> = ({
  projectItem,
  sourceVerses,
  targetVerses,
  userdetail,
  readOnly = false,
}) => {
  const addVerseMutation = useAddTranslatedVerse();
  const submitChapterMutation = useSubmitChapter();
  const navigate = useNavigate();

  const [verses, setVerses] = useState<TargetVerse[]>(targetVerses);
  const [activeVerseId, setActiveVerseId] = useState(1);
  const [previousActiveVerseId, setPreviousActiveVerseId] = useState<number | null>(null);
  const [revealedVerses, setRevealedVerses] = useState<Set<number>>(new Set());

  const targetScrollRef = useRef<HTMLDivElement>(null);

  const textareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [buttonTop, setButtonTop] = useState<number>(0);

  const lastRevealedVerseNumber = useMemo(
    () => (revealedVerses.size > 0 ? Math.max(...Array.from(revealedVerses)) : 1),
    [revealedVerses]
  );

  const lastRevealedVerse = useMemo(
    () => verses.find(v => v.verseNumber === lastRevealedVerseNumber),
    [verses, lastRevealedVerseNumber]
  );

  const lastRevealedVerseHasContent = useMemo(
    () => Boolean(lastRevealedVerse?.content.trim()),
    [lastRevealedVerse]
  );

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

  const handleBack = () => {
    void navigate({ to: '/' });
  };

  useEffect(() => {
    if (targetVerses.length === 0) return;

    if (!readOnly) {
      targetVerses.forEach(verse => {
        setInitialContent(verse.verseNumber, verse.content);
      });
    }

    // Find the last verse with content
    const lastVerseWithContent = (() => {
      for (let i = targetVerses.length - 1; i >= 0; i--) {
        if (targetVerses[i].content.trim() !== '') return targetVerses[i];
      }
      return targetVerses[0];
    })();

    // Check if all verses are completed
    const allVersesCompleted = sourceVerses.every(sourceVerse => {
      const targetVerse = targetVerses.find(tv => tv.verseNumber === sourceVerse.verseNumber);
      return targetVerse && targetVerse.content.trim() !== '';
    });

    // Set active verse: first if all completed, otherwise last edited
    const activeVerseNumber = allVersesCompleted ? 1 : lastVerseWithContent.verseNumber;
    setActiveVerseId(activeVerseNumber);

    if (!allVersesCompleted && activeVerseNumber > 1 && !readOnly) {
      const verseDiv = verseRefs.current[activeVerseNumber];
      if (verseDiv) {
        verseDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    const initiallyRevealed = new Set<number>();

    if (readOnly) {
      sourceVerses.forEach(v => initiallyRevealed.add(v.verseNumber));
    } else {
      targetVerses
        .filter(v => v.verseNumber <= lastVerseWithContent.verseNumber)
        .forEach(v => initiallyRevealed.add(v.verseNumber));
      initiallyRevealed.add(activeVerseNumber);
    }

    setRevealedVerses(initiallyRevealed);
  }, [targetVerses, sourceVerses, setInitialContent, readOnly]);

  // Mark active verse as revealed
  useEffect(() => {
    if (!readOnly) {
      setRevealedVerses(prev => {
        if (prev.has(activeVerseId)) return prev;
        const next = new Set(prev);
        next.add(activeVerseId);
        return next;
      });
    }
  }, [activeVerseId, readOnly]);

  // Auto-resize revealed textareas
  useEffect(() => {
    if (!readOnly) {
      revealedVerses.forEach(verseNumber => {
        const textarea = textareaRefs.current[verseNumber];
        if (textarea) autoResizeTextarea(textarea);
      });
    }
  }, [revealedVerses, readOnly]);

  // Initialize verses if empty
  useEffect(() => {
    if (verses.length === 0) {
      setVerses([{ verseNumber: 1, content: '' }]);
    } else if (!readOnly) {
      verses.forEach(verse => {
        const textarea = textareaRefs.current[verse.verseNumber];
        if (textarea && verse.content) {
          autoResizeTextarea(textarea);
        }
      });
    }
  }, [verses, readOnly]);

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(20, textarea.scrollHeight) + 'px';
  };

  const updateButtonPosition = useCallback(() => {
    if (readOnly) return;

    const container = targetScrollRef.current;
    if (!container) return;

    const lastRevealedVerseDiv = verseRefs.current[lastRevealedVerseNumber];
    if (!lastRevealedVerseDiv) return;

    const containerRect = container.getBoundingClientRect();
    const verseRect = lastRevealedVerseDiv.getBoundingClientRect();
    const top = container.scrollTop + (verseRect.bottom - containerRect.top);
    setButtonTop(top);
  }, [lastRevealedVerseNumber, readOnly]);

  const scrollVerseToTop = useCallback((verseNumber: number) => {
    const container = targetScrollRef.current;
    const row = verseRefs.current[verseNumber];
    if (!container || !row) return;

    const containerRect = container.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();

    const newScrollTop = container.scrollTop + (rowRect.top - containerRect.top);
    container.scrollTo({ top: newScrollTop, behavior: 'smooth' });
  }, []);

  useLayoutEffect(() => {
    if (readOnly) return;

    const textarea = textareaRefs.current[activeVerseId];
    if (textarea) {
      if (document.activeElement !== textarea) {
        textarea.focus();
        const len = textarea.value.length;
        try {
          textarea.setSelectionRange(len, len);
        } catch {}
      }
      autoResizeTextarea(textarea);
    }
    updateButtonPosition();
  }, [activeVerseId, revealedVerses, updateButtonPosition, readOnly]);

  const totalSourceVerses = sourceVerses.length;
  const versesWithText = verses.filter(v => v.content.trim() !== '').length;
  const progressPercentage = (versesWithText / totalSourceVerses) * 100;
  const isTranslationComplete = versesWithText === totalSourceVerses;

  const isAnythingSaving =
    !readOnly &&
    verses.some(v => {
      const status = getSaveStatus(v.verseNumber);
      return status.showLoader;
    });

  const hasAnyError =
    !readOnly &&
    verses.some(v => {
      const status = getSaveStatus(v.verseNumber);
      return status.hasRetryScheduled;
    });

  const updateTargetVerse = (id: number, text: string) => {
    if (readOnly) return;

    setVerses(currentVerses =>
      currentVerses.map(verse => (verse.verseNumber === id ? { ...verse, content: text } : verse))
    );
    debouncedSave(id, text);
  };

  const handleTextChange = (verseId: number, text: string) => {
    if (readOnly) return;

    updateTargetVerse(verseId, text);

    const textarea = textareaRefs.current[verseId];
    if (textarea) {
      autoResizeTextarea(textarea);
    }
    updateButtonPosition();
  };

  const handleActiveVerseChange = async (newVerseId: number) => {
    if (readOnly) return;

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
    // useLayoutEffect will focus and reposition Next button after state updates
    // Also scroll so the previous verse aligns to the top (or verse 1)
    const prevId = Math.max(1, newVerseId - 1);
    requestAnimationFrame(() => scrollVerseToTop(prevId));
  };

  const advanceToVerse = useCallback(
    async (nextVerseId: number, verseToSave?: { verseNumber: number; content: string }) => {
      if (readOnly || nextVerseId > totalSourceVerses) return;

      // Create the next verse if it doesn't exist
      const nextVerseExists = verses.find(v => v.verseNumber === nextVerseId);
      if (!nextVerseExists) {
        setVerses(prev => [...prev, { verseNumber: nextVerseId, content: '' }]);
        setInitialContent(nextVerseId, '');
      }

      // Save the specified verse if it has unsaved changes
      if (verseToSave) {
        const status = getSaveStatus(verseToSave.verseNumber);
        if (status.hasUnsavedChanges) {
          await saveImmediately(verseToSave.verseNumber, verseToSave.content);
        }
      }

      // Update active verse and scroll
      setPreviousActiveVerseId(activeVerseId);
      setActiveVerseId(nextVerseId);

      const prevId = Math.max(1, nextVerseId - 1);
      requestAnimationFrame(() => scrollVerseToTop(prevId));
    },
    [
      activeVerseId,
      verses,
      totalSourceVerses,
      saveImmediately,
      setInitialContent,
      getSaveStatus,
      scrollVerseToTop,
      readOnly,
    ]
  );

  const moveToNextVerse = useCallback(async () => {
    if (readOnly) return;

    const currentVerse = verses.find(v => v.verseNumber === activeVerseId);
    if (!currentVerse || currentVerse.content.trim() === '') return;

    await advanceToVerse(activeVerseId + 1, currentVerse);
  }, [activeVerseId, verses, advanceToVerse, readOnly]);

  const revealNextVerse = useCallback(async () => {
    if (readOnly || !lastRevealedVerseHasContent || !lastRevealedVerse) return;

    await advanceToVerse(lastRevealedVerseNumber + 1, lastRevealedVerse);
  }, [
    lastRevealedVerseNumber,
    lastRevealedVerseHasContent,
    lastRevealedVerse,
    advanceToVerse,
    readOnly,
  ]);

  const handleSubmit = async () => {
    if (readOnly || !isTranslationComplete) return;

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
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (readOnly) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await moveToNextVerse();
    }
  };

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='flex-shrink-0'>
        <div className='flex items-center justify-between px-6 py-4'>
          <div className='flex flex-shrink-0 items-center gap-4'>
            {readOnly && (
              <span title='Back'>
                <ChevronLeft
                  className='flex-shrink-0 cursor-pointer'
                  size={'24px'}
                  strokeWidth={'2px'}
                  onClick={handleBack}
                />
              </span>
            )}
            <h2 className='text-3xl font-bold text-gray-900'>
              {projectItem.book} {projectItem.chapterNumber}
            </h2>
          </div>

          {!readOnly && (
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
          )}
        </div>
      </div>

      <div className='mx-auto max-w-7xl flex-1 overflow-hidden'>
        <div className='grid h-full grid-cols-2' style={{ gridTemplateRows: '4rem 1fr' }}>
          <div className='bg-background sticky top-0 z-10 ml-8 px-6 py-4'>
            <h3 className='text-xl font-bold text-gray-800'>{projectItem.bibleName}</h3>
          </div>
          <div className='bg-background sticky top-0 z-10 py-4'>
            <h3 className='text-xl font-bold text-gray-800'>{projectItem.targetLanguage}</h3>
          </div>

          <div
            ref={targetScrollRef}
            className='relative col-span-2 flex h-full flex-col overflow-y-auto'
            onScroll={() => !readOnly && updateButtonPosition()}
          >
            {sourceVerses.map(verse => {
              const isActive = !readOnly && activeVerseId === verse.verseNumber;
              const currentTargetVerse = verses.find(v => v.verseNumber === verse.verseNumber);
              const shouldShowTarget =
                readOnly || isActive || revealedVerses.has(verse.verseNumber);

              return (
                <div
                  key={verse.verseNumber}
                  ref={el => (verseRefs.current[verse.verseNumber] = el)}
                  className='grid grid-cols-2 gap-4 px-6 py-4'
                >
                  {/* Source verse */}
                  <div className='col-1 flex items-start transition-all'>
                    <div className='w-8 flex-shrink-0'>
                      <span className='text-lg font-medium text-gray-700'>{verse.verseNumber}</span>
                    </div>
                    <div className='flex-1'>
                      <div
                        className={`bg-card rounded-lg border-2 px-4 py-1 shadow-sm transition-all ${isActive ? 'border-primary' : ''}`}
                      >
                        <p className='min-h-12 content-center overflow-hidden text-base leading-snug text-gray-800 outline-none'>
                          {verse.text}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Target verse */}
                  <div className={`col-2 flex transition-all ${shouldShowTarget ? '' : 'hidden'}`}>
                    {readOnly ? (
                      <div className='bg-card flex-1 rounded-lg border-2 px-4 py-3 shadow-sm'>
                        <p className='min-h-12 text-base leading-snug text-gray-800'>
                          {currentTargetVerse?.content ?? ''}
                        </p>
                      </div>
                    ) : (
                      <div
                        className={`flex-1 cursor-pointer rounded-lg border-2 px-4 py-1 shadow-sm transition-all ${isActive ? 'border-primary' : ''} ${currentTargetVerse?.content.trim() !== '' && !isActive ? 'bg-card' : ''}`}
                        onClick={() => handleActiveVerseChange(verse.verseNumber)}
                      >
                        <textarea
                          ref={el => (textareaRefs.current[verse.verseNumber] = el)}
                          aria-label={`Translation for verse ${verse.verseNumber}`}
                          autoCapitalize='sentences'
                          autoCorrect='on'
                          className='h-auto min-h-3 w-full resize-none content-center overflow-hidden border-none bg-transparent text-base leading-snug text-gray-800 outline-none'
                          id={`verse-${verse.verseNumber}`}
                          placeholder='Enter translation...'
                          spellCheck={true}
                          value={currentTargetVerse?.content ?? ''}
                          onChange={e => handleTextChange(verse.verseNumber, e.target.value)}
                          onFocus={() => handleActiveVerseChange(verse.verseNumber)}
                          onKeyDown={handleKeyDown}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {!readOnly && revealedVerses.size < totalSourceVerses && (
              <div className='absolute right-4 z-10' style={{ top: buttonTop }}>
                <Button
                  className={`bg-primary flex items-center gap-2 px-6 py-2 font-medium shadow-lg transition-all ${
                    lastRevealedVerseHasContent
                      ? 'hover:bg-primary-hover cursor-pointer text-white'
                      : 'cursor-not-allowed bg-gray-300 text-gray-500'
                  }`}
                  disabled={!lastRevealedVerseHasContent}
                  title='Next Verse (Enter)'
                  onClick={revealNextVerse}
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

  const translationMatch = useMatch({
    from: '/translation/$bookId/$chapterNumber',
    shouldThrow: false,
  });

  const viewMatch = useMatch({
    from: '/view/$bookId/$chapterNumber',
    shouldThrow: false,
  });

  const loaderData = translationMatch?.loaderData ?? viewMatch?.loaderData;
  const isReadOnly = !!viewMatch;

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
      readOnly={isReadOnly}
      sourceVerses={loaderData.sourceVerses}
      targetVerses={loaderData.targetVerses}
      userdetail={userdetail}
    />
  );
};

export default DraftingPage;
