import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useMatch, useNavigate } from '@tanstack/react-router';
import { BookText, ChevronLeft, Loader } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAddTranslatedVerse, useSubmitChapter } from '@/hooks/useBibleTarget';
import { useBibleTextDebounce } from '@/hooks/useBibleTextDebounce';
import { useResourceState, useSaveResourceState } from '@/hooks/useResourceStatePersistence';
import { ResourcePanel } from '@/layouts/resources/ResourcePanel';
import {
  type DraftingUIProps,
  type ResourceName,
  type Source,
  type TargetVerse,
} from '@/lib/types';
import { useAppStore } from '@/store/store';

const RESOURCE_NAMES: ResourceName[] = [
  { id: 'UWTranslationNotes', name: 'Translation Notes (uW)' },
  { id: 'Images', name: 'Images' },
];

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

  const [showResources, setShowResources] = useState(false);
  const [currentResource, setCurrentResource] = useState<ResourceName>(RESOURCE_NAMES[0]);
  const [currentLanguage, setCurrentLanguage] = useState('');

  // Fetch saved resource state
  const { data: savedResourceState, isFetched } = useResourceState(
    projectItem.chapterAssignmentId,
    userdetail.email
  );

  const saveResourceStateMutation = useSaveResourceState();

  const isInitializedRef = useRef(false);
  const lastSavedStateRef = useRef<{
    bookCode: string;
    chapterNumber: number;
    verseNumber: number;
    activeResource: string;
    languageCode: string;
    tabStatus: boolean;
  } | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize auto-resize function
  const autoResizeTextarea = useCallback((textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(20, textarea.scrollHeight) + 'px';
  }, []);

  // Initialize resource state from saved data (runs once)
  useEffect(() => {
    if (!isFetched || isInitializedRef.current) return;

    if (savedResourceState) {
      // Restore saved state
      const { activeResource, languageCode, tabStatus } = savedResourceState;

      if (typeof tabStatus === 'boolean') {
        setShowResources(tabStatus);
      }

      if (activeResource) {
        const savedResource = RESOURCE_NAMES.find(r => r.id === activeResource);
        setCurrentResource(savedResource ?? RESOURCE_NAMES[0]);
      }

      // Use saved language if available, otherwise use source language as default
      if (languageCode) {
        setCurrentLanguage(languageCode);
      } else {
        // Set default to source language only when no saved data
        setCurrentLanguage(projectItem.sourceLangCode);
      }

      lastSavedStateRef.current = {
        bookCode: projectItem.book,
        chapterNumber: projectItem.chapterNumber,
        verseNumber: activeVerseId,
        activeResource: activeResource || RESOURCE_NAMES[0].id,
        languageCode: languageCode || projectItem.sourceLangCode,
        tabStatus: typeof tabStatus === 'boolean' ? tabStatus : false,
      };
    } else {
      // No saved data - use source language as default
      setCurrentLanguage(projectItem.sourceLangCode);

      lastSavedStateRef.current = {
        bookCode: projectItem.book,
        chapterNumber: projectItem.chapterNumber,
        verseNumber: activeVerseId,
        activeResource: RESOURCE_NAMES[0].id,
        languageCode: projectItem.sourceLangCode,
        tabStatus: false,
      };
    }

    isInitializedRef.current = true;
  }, [
    isFetched,
    savedResourceState,
    projectItem.sourceLangCode,
    projectItem.book,
    projectItem.chapterNumber,
    activeVerseId,
  ]);

  // Save resource state with debouncing (only after initialization)
  useEffect(() => {
    if (!isInitializedRef.current) return;

    const currentState = {
      bookCode: projectItem.book,
      chapterNumber: projectItem.chapterNumber,
      verseNumber: activeVerseId,
      activeResource: currentResource.id,
      languageCode: currentLanguage || projectItem.sourceLangCode,
      tabStatus: showResources,
    };

    // Check if state actually changed
    if (lastSavedStateRef.current) {
      const hasChanged =
        lastSavedStateRef.current.bookCode !== currentState.bookCode ||
        lastSavedStateRef.current.chapterNumber !== currentState.chapterNumber ||
        lastSavedStateRef.current.verseNumber !== currentState.verseNumber ||
        lastSavedStateRef.current.activeResource !== currentState.activeResource ||
        lastSavedStateRef.current.languageCode !== currentState.languageCode ||
        lastSavedStateRef.current.tabStatus !== currentState.tabStatus;

      if (!hasChanged) {
        return;
      }
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save by 500ms
    saveTimeoutRef.current = setTimeout(() => {
      saveResourceStateMutation.mutate({
        chapterAssignmentId: projectItem.chapterAssignmentId,
        resourceState: { resources: currentState },
        email: userdetail.email,
      });
      lastSavedStateRef.current = currentState;
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    currentResource.id,
    currentLanguage,
    showResources,
    activeVerseId,
    projectItem.chapterAssignmentId,
    projectItem.book,
    projectItem.chapterNumber,
    projectItem.sourceLangCode,
    userdetail.email,
    saveResourceStateMutation,
  ]);

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

  const { setUserDashboardTab } = useAppStore();

  const handleBack = () => {
    setUserDashboardTab('my-history');
    void navigate({ to: '/' });
  };

  const { debouncedSave, saveImmediately, getSaveStatus, setInitialContent } = useBibleTextDebounce(
    {
      onSave: saveVerse,
      debounceMs: 2000,
      retryDelayMs: 10000,
    }
  );

  useEffect(() => {
    if (targetVerses.length === 0) return;

    targetVerses.forEach(verse => {
      setInitialContent(verse.verseNumber, verse.content);
    });

    const allVersesCompleted = sourceVerses.every(sourceVerse => {
      const targetVerse = targetVerses.find(tv => tv.verseNumber === sourceVerse.verseNumber);
      return targetVerse && targetVerse.content.trim() !== '';
    });

    let mostRecentlyEditedVerseNumber = 1;

    if (!allVersesCompleted) {
      const firstEmptyVerse = targetVerses.find(v => v.content.trim() === '') ?? targetVerses[0];
      mostRecentlyEditedVerseNumber = firstEmptyVerse.verseNumber;
      setActiveVerseId(mostRecentlyEditedVerseNumber);

      if (mostRecentlyEditedVerseNumber > 1) {
        const verseDiv = verseRefs.current[mostRecentlyEditedVerseNumber];
        if (verseDiv) {
          verseDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    const lastVerseWithContent = (() => {
      for (let i = targetVerses.length - 1; i >= 0; i--) {
        if (targetVerses[i].content.trim() !== '') return targetVerses[i];
      }
      return targetVerses[0];
    })();

    const initiallyRevealed = new Set<number>();
    targetVerses.forEach(v => {
      if (v.verseNumber <= lastVerseWithContent.verseNumber) initiallyRevealed.add(v.verseNumber);
    });
    initiallyRevealed.add(mostRecentlyEditedVerseNumber);
    setRevealedVerses(initiallyRevealed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    setRevealedVerses(prev => {
      if (prev.has(activeVerseId)) return prev;
      const next = new Set(prev);
      next.add(activeVerseId);
      return next;
    });
  }, [activeVerseId]);

  useEffect(() => {
    revealedVerses.forEach(verseNumber => {
      const textarea = textareaRefs.current[verseNumber];
      if (textarea) autoResizeTextarea(textarea);
    });
  }, [revealedVerses, autoResizeTextarea]);

  useEffect(() => {
    verses.forEach(verse => {
      const textarea = textareaRefs.current[verse.verseNumber];
      if (textarea && verse.content) {
        autoResizeTextarea(textarea);
      }
    });
  }, [verses, autoResizeTextarea]);

  const updateButtonPosition = useCallback(() => {
    const container = targetScrollRef.current;
    const lastRevealedVerseDiv = verseRefs.current[lastRevealedVerseNumber];
    if (!container || !lastRevealedVerseDiv) return;

    const containerRect = container.getBoundingClientRect();
    const verseRect = lastRevealedVerseDiv.getBoundingClientRect();
    const top = container.scrollTop + (verseRect.bottom - containerRect.top);
    setButtonTop(top);
  }, [lastRevealedVerseNumber]);

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
  }, [activeVerseId, verses, revealedVerses, updateButtonPosition, autoResizeTextarea]);

  const totalSourceVerses = sourceVerses.length;
  const versesWithText = verses.filter(v => v.content.trim() !== '').length;
  const progressPercentage = (versesWithText / totalSourceVerses) * 100;
  const isTranslationComplete = versesWithText === totalSourceVerses;

  const isAnythingSaving = !readOnly && verses.some(v => getSaveStatus(v.verseNumber).showLoader);
  const hasAnyError = !readOnly && verses.some(v => getSaveStatus(v.verseNumber).hasRetryScheduled);

  const handleTextChange = useCallback(
    (verseId: number, text: string) => {
      setVerses(currentVerses =>
        currentVerses.map(verse =>
          verse.verseNumber === verseId ? { ...verse, content: text } : verse
        )
      );
      debouncedSave(verseId, text);

      const textarea = textareaRefs.current[verseId];
      if (textarea) autoResizeTextarea(textarea);
      updateButtonPosition();
    },
    [debouncedSave, autoResizeTextarea, updateButtonPosition]
  );

  const handleActiveVerseChange = useCallback(
    async (newVerseId: number) => {
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
      const prevId = Math.max(1, newVerseId - 1);
      requestAnimationFrame(() => scrollVerseToTop(prevId));
    },
    [previousActiveVerseId, verses, getSaveStatus, saveImmediately, activeVerseId, scrollVerseToTop]
  );

  const advanceToVerse = useCallback(
    async (nextVerseId: number, verseToSave?: { verseNumber: number; content: string }) => {
      if (nextVerseId > totalSourceVerses) return;

      const nextVerseExists = verses.find(v => v.verseNumber === nextVerseId);
      if (!nextVerseExists) {
        setVerses(prev => [...prev, { verseNumber: nextVerseId, content: '' }]);
        setInitialContent(nextVerseId, '');
      }

      if (verseToSave) {
        const status = getSaveStatus(verseToSave.verseNumber);
        if (status.hasUnsavedChanges) {
          await saveImmediately(verseToSave.verseNumber, verseToSave.content);
        }
      }

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
    ]
  );

  const moveToNextVerse = useCallback(async () => {
    const currentVerse = verses.find(v => v.verseNumber === activeVerseId);
    if (!currentVerse || currentVerse.content.trim() === '') return;
    await advanceToVerse(activeVerseId + 1, currentVerse);
  }, [activeVerseId, verses, advanceToVerse]);

  const revealNextVerse = useCallback(async () => {
    if (!lastRevealedVerseHasContent || !lastRevealedVerse) return;
    await advanceToVerse(lastRevealedVerseNumber + 1, lastRevealedVerse);
  }, [lastRevealedVerseNumber, lastRevealedVerseHasContent, lastRevealedVerse, advanceToVerse]);

  const handleSubmit = useCallback(async () => {
    if (!isTranslationComplete) return;

    const savePromises = verses
      .filter(verse => getSaveStatus(verse.verseNumber).hasUnsavedChanges)
      .map(verse => saveImmediately(verse.verseNumber, verse.content));

    await Promise.all(savePromises);

    await submitChapterMutation.mutateAsync({
      chapterAssignmentId: projectItem.chapterAssignmentId,
      email: userdetail.email,
    });
    await navigate({ to: '/' });
  }, [
    isTranslationComplete,
    verses,
    getSaveStatus,
    saveImmediately,
    submitChapterMutation,
    projectItem.chapterAssignmentId,
    userdetail.email,
    navigate,
  ]);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        await moveToNextVerse();
      }
    },
    [moveToNextVerse]
  );

  const toggleResources = useCallback(() => {
    setShowResources(prev => !prev);
  }, []);

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
              <Button
                aria-pressed={showResources}
                className='bg-primary flex cursor-pointer items-center gap-2'
                title={showResources ? 'Hide Resources' : 'Show Resources'}
                type='button'
                onClick={toggleResources}
              >
                <BookText color='#ffffff' />
              </Button>
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

      <div className='flex h-full overflow-hidden'>
        {showResources && isInitializedRef.current && (
          <div className='w-[25%]'>
            <ResourcePanel
              activeVerseId={activeVerseId}
              initialLanguage={currentLanguage}
              initialResource={currentResource}
              resourceNames={RESOURCE_NAMES}
              sourceData={projectItem}
              onLanguageChange={setCurrentLanguage}
              onResourceChange={setCurrentResource}
            />
          </div>
        )}

        <div className={`mx-auto ${showResources ? '' : 'max-w-7xl'} flex-1 overflow-hidden`}>
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
              style={{ scrollbarGutter: 'stable' }}
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
                        <span className='text-lg font-medium text-gray-700'>
                          {verse.verseNumber}
                        </span>
                      </div>
                      <div className='flex-1'>
                        <div
                          className={`bg-card rounded-lg border border-2 px-4 py-1 shadow-sm transition-all ${
                            isActive ? 'border-primary' : ''
                          }`}
                        >
                          <p className='min-h-12 content-center overflow-hidden text-base leading-relaxed text-gray-800 outline-none'>
                            {verse.text}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Target verse */}
                    <div
                      className={`col-2 flex transition-all ${shouldShowTarget ? '' : 'hidden'}`}
                    >
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
                    title='Next Verse'
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
