import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useMatch, useRouter } from '@tanstack/react-router';
import { BookText, ChevronLeft, Loader } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAddTranslatedVerse, useSubmitChapter } from '@/hooks/useBibleTarget';
import { useChapterPresence } from '@/hooks/useChapterPresence';
import { useDrafting } from '@/hooks/useDrafting';
import { useResourceState, useSaveResourceState } from '@/hooks/useResourceStatePersistence';
import { fetchAITranslation } from '@/hooks/useVachanAI';
import { ResourcePanel } from '@/layouts/resources/ResourcePanel';
import { getStatusDisplay } from '@/lib/formatters';
import { Logger } from '@/lib/services/logger';
import {
  ChapterAssignmentStatus,
  ChapterAssignmentStatusNextAction,
  type ChapterAssignmentStatus as ChapterAssignmentStatusType,
  type DraftingUIProps,
  type ResourceName,
  type Source,
} from '@/lib/types';
import { useAppStore } from '@/store/store';

const RESOURCE_NAMES: ResourceName[] = [
  { id: 'UWTranslationNotes', name: 'Translation Notes (uW)' },
  { id: 'Images', name: 'Images' },
];

/**
 * Given what the user has typed and the full AI suggestion,
 * returns the ghost text suffix to render after the cursor.
 *
 * Case 1: user is typing along the AI text from the start
 *   → return the remaining suffix of aiText
 * Case 2: the last partial word the user typed is a prefix of
 *         any word in the AI suggestion
 *   → return the word completion + rest of aiText from that word onward
 * Case 3: no match → return ''
 */
const getInlineSuggestion = (currentText: string, aiText: string): string => {
  if (!aiText) return '';

  if (aiText.startsWith(currentText)) {
    return aiText.slice(currentText.length);
  }

  const lastWordMatch = currentText.match(/(\S+)$/);
  if (lastWordMatch) {
    const lastWord = lastWordMatch[1].toLowerCase();
    const aiWords = aiText.split(/\s+/).filter(Boolean);

    for (let i = 0; i < aiWords.length; i++) {
      const aiWord = aiWords[i].toLowerCase();
      if (aiWord.startsWith(lastWord) && aiWord.length > lastWord.length) {
        const wordRemainder = aiWords[i].slice(lastWord.length);
        const rest = aiWords.slice(i + 1).join(' ');
        return wordRemainder + (rest ? ' ' + rest : '');
      }
    }
  }

  return '';
};

/**
 * Returns the next word (or word completion) to append when Tab is pressed.
 * Same matching logic as getInlineSuggestion but stops after one word.
 */
const getNextWordSuggestion = (currentText: string, aiText: string): string => {
  if (!aiText) return '';

  if (aiText.startsWith(currentText)) {
    const remaining = aiText.slice(currentText.length);
    if (!remaining) return '';
    const match = remaining.match(/^(\s*\S+)/);
    return match?.[1] ?? remaining;
  }

  const lastWordMatch = currentText.match(/(\S+)$/);
  if (lastWordMatch) {
    const lastWord = lastWordMatch[1].toLowerCase();
    const aiWords = aiText.split(/\s+/).filter(Boolean);

    for (let i = 0; i < aiWords.length; i++) {
      const aiWord = aiWords[i].toLowerCase();
      if (aiWord.startsWith(lastWord) && aiWord.length > lastWord.length) {
        const wordRemainder = aiWords[i].slice(lastWord.length);
        const rest = aiWords.slice(i + 1).join(' ');
        const nextWord = rest.split(/\s+/)[0] ?? '';
        return wordRemainder + (nextWord ? ' ' + nextWord : '');
      }
    }
  }

  return '';
};

const DraftingUI: React.FC<DraftingUIProps> = ({
  projectItem,
  sourceVerses,
  targetVerses,
  userdetail,
  readOnly = false,
}) => {
  const addVerseMutation = useAddTranslatedVerse();
  const submitChapterMutation = useSubmitChapter();
  const router = useRouter();

  const [showResources, setShowResources] = useState(false);
  const [currentResource, setCurrentResource] = useState<ResourceName>(RESOURCE_NAMES[0]);
  const [currentLanguage, setCurrentLanguage] = useState('');

  // AI translation state
  const [aiTranslation, setAiTranslation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

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
  const clearCurrentProjectItem = useAppStore(state => state.clearCurrentProjectItem);
  const setPresenceWarning = useAppStore(state => state.setPresenceWarning);
  const isDraft = projectItem.chapterStatus === ChapterAssignmentStatus.DRAFT;
  const isCommunityReview = projectItem.chapterStatus === ChapterAssignmentStatus.COMMUNITY_REVIEW;
  const isLinguistCheck = projectItem.chapterStatus === ChapterAssignmentStatus.LINGUIST_CHECK;
  const isTheologicalCheck =
    projectItem.chapterStatus === ChapterAssignmentStatus.THEOLOGICAL_CHECK;
  const isConsultantCheck = projectItem.chapterStatus === ChapterAssignmentStatus.CONSULTANT_CHECK;
  const isComplete = projectItem.chapterStatus === ChapterAssignmentStatus.COMPLETE;

  const { editorName } = useChapterPresence(
    projectItem.chapterAssignmentId,
    isCommunityReview || isLinguistCheck || isTheologicalCheck || isConsultantCheck,
    userdetail.email
  );

  useEffect(() => {
    setPresenceWarning(editorName);
    return () => setPresenceWarning(null);
  }, [editorName, setPresenceWarning]);

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

  const {
    verses,
    activeVerseId,
    revealedVerses,
    buttonTop,
    lastRevealedVerseHasContent,
    targetScrollRef,
    textareaRefs,
    verseRefs,
    getSaveStatus,
    saveImmediately,
    handleTextChange,
    handleActiveVerseChange,
    moveToNextVerse,
    revealNextVerse,
    updateButtonPosition,
  } = useDrafting({
    sourceVerses,
    targetVerses,
    readOnly,
    onSave: saveVerse,
  });

  const handleBack = useCallback(() => {
    clearCurrentProjectItem();

    // If user navigated directly to this page, back button will be routed to dashboard instead.
    if (window.history.length <= 2) {
      void router.navigate({ to: '/' });
      return;
    }

    router.history.back();
  }, [clearCurrentProjectItem, router]);

  // Fetch AI translation whenever active verse changes
  useEffect(() => {
    if (readOnly || !activeVerseId) return;

    const activeVerse = sourceVerses.find((v: Source) => v.verseNumber === activeVerseId);
    if (!activeVerse?.text) return;

    let cancelled = false;

    const fetchTranslation = async () => {
      setIsAiLoading(true);
      setAiTranslation('');
      try {
        const result = await fetchAITranslation(
          projectItem.sourceLangCode,
          projectItem.targetLanguage,
          [activeVerse.text]
        );
        if (!cancelled) {
          setAiTranslation(result.output[0] ?? '');
        }
      } catch (err) {
        if (!cancelled) {
          Logger.logException(err, { context: 'AI translation failed' });
        }
      } finally {
        if (!cancelled) {
          setIsAiLoading(false);
        }
      }
    };

    void fetchTranslation();

    return () => {
      cancelled = true;
    };
  }, [
    activeVerseId,
    sourceVerses,
    projectItem.sourceLangCode,
    projectItem.targetLanguage,
    readOnly,
  ]);

  // Initialize resource state from saved data
  useEffect(() => {
    if (!isFetched || isInitializedRef.current) return;

    if (savedResourceState) {
      const { activeResource, languageCode, tabStatus } = savedResourceState;

      if (typeof tabStatus === 'boolean') {
        setShowResources(tabStatus);
      }

      if (activeResource) {
        const savedResource = RESOURCE_NAMES.find(r => r.id === activeResource);
        setCurrentResource(savedResource ?? RESOURCE_NAMES[0]);
      }

      if (languageCode) {
        setCurrentLanguage(languageCode);
      } else {
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

  // Save resource state with debouncing
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

  const totalSourceVerses = sourceVerses.length;
  const versesWithText = verses.filter(v => v.content.trim() !== '').length;
  const progressPercentage = (versesWithText / totalSourceVerses) * 100;
  const isTranslationComplete = versesWithText === totalSourceVerses;

  const isAnythingSaving = !readOnly && verses.some(v => getSaveStatus(v.verseNumber).showLoader);
  const hasAnyError = !readOnly && verses.some(v => getSaveStatus(v.verseNumber).hasRetryScheduled);

  const buttonText =
    ChapterAssignmentStatusNextAction[projectItem.chapterStatus as ChapterAssignmentStatus];

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
    clearCurrentProjectItem();
    router.history.back();
  }, [
    isTranslationComplete,
    verses,
    getSaveStatus,
    saveImmediately,
    submitChapterMutation,
    projectItem.chapterAssignmentId,
    userdetail.email,
    clearCurrentProjectItem,
    router,
  ]);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Tab: accept next word from AI suggestion word-by-word
      if (e.key === 'Tab') {
        e.preventDefault();
        if (!aiTranslation || !activeVerseId) return;
        const currentContent = (e.target as HTMLTextAreaElement).value;
        const append = getNextWordSuggestion(currentContent, aiTranslation);
        if (append) {
          handleTextChange(activeVerseId, currentContent + append);
        }
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        await moveToNextVerse();
      }
    },
    [moveToNextVerse, handleTextChange, aiTranslation, activeVerseId]
  );

  const toggleResources = useCallback(() => {
    setShowResources(prev => !prev);
  }, []);

  const backButton = (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <ChevronLeft
              className='shrink-0 cursor-pointer'
              size={'24px'}
              strokeWidth={'2px'}
              onClick={handleBack}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent
          align='start'
          className='bg-popover text-popover-foreground border-border rounded-md border px-4 py-2.5 text-sm font-semibold whitespace-nowrap shadow-lg'
          side='top'
        >
          Back
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='shrink-0'>
        <div className='flex items-center justify-between py-4 pr-0.5'>
          <div className='flex shrink-0 items-center gap-4'>
            {backButton}
            <h2 className='text-3xl font-bold'>
              {projectItem.book} {projectItem.chapterNumber}
            </h2>
            <Badge
              className='rounded-full border-2 px-3 py-1 text-sm font-bold whitespace-nowrap text-(--text-disabled)'
              variant='outline'
            >
              {getStatusDisplay(projectItem.chapterStatus as ChapterAssignmentStatusType)}
            </Badge>
          </div>

          {!readOnly && (
            <div className='flex flex-1 items-center justify-end gap-4'>
              <div className='flex items-center gap-2'>
                {isAnythingSaving && <Loader className='text-primary h-4 w-4 animate-spin' />}
                {hasAnyError && <span className='text-sm text-red-500'>Auto-save failed</span>}
              </div>

              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-pressed={showResources}
                      className='bg-primary flex cursor-pointer items-center gap-2'
                      type='button'
                      onClick={toggleResources}
                    >
                      <BookText color='#ffffff' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    align='start'
                    className='bg-popover text-popover-foreground border-border rounded-md border px-4 py-2.5 text-sm font-semibold whitespace-nowrap shadow-lg'
                    side='top'
                  >
                    {showResources ? 'Hide Resources' : 'Show Resources'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {!isComplete && isDraft && (
                <div className='bg-input rounded-lg border sm:w-40 md:w-50 lg:w-76 xl:w-105'>
                  <div className='h-4 overflow-hidden rounded-full'>
                    <div
                      className='bg-primary h-full rounded-full transition-all duration-300'
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {!isComplete && (
                <Button
                  className={`shrink-0 px-6 py-2 font-medium transition-all ${
                    isTranslationComplete
                      ? 'bg-primary hover:bg-primary-hover cursor-pointer text-white'
                      : 'cursor-not-allowed bg-gray-300 text-gray-500'
                  }`}
                  disabled={!isTranslationComplete}
                  onClick={handleSubmit}
                >
                  {buttonText}
                </Button>
              )}
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
          <div
            className='ml-2 grid h-full content-start'
            style={{
              gridTemplateColumns: '2rem 1fr 1fr',
              gridTemplateRows: 'auto 1fr',
              scrollbarGutter: 'stable',
            }}
          >
            <div className='sticky top-0 z-10 w-8 px-4 py-3'></div>
            <div className='sticky top-0 z-10 px-6 py-3'>
              <h3 className='text-xl font-semibold'>{projectItem.bibleName}</h3>
            </div>
            <div className='sticky top-0 z-10 px-6 py-3'>
              <h3 className='text-xl font-semibold'>{projectItem.targetLanguage}</h3>
            </div>
            <div
              className={`col-span-3 flex flex-col overflow-hidden ${showResources ? 'h-full rounded-md border' : ''}`}
            >
              <div
                ref={targetScrollRef}
                className='relative flex h-full flex-col overflow-y-auto'
                style={{ scrollbarGutter: 'stable' }}
                onScroll={() => !readOnly && updateButtonPosition()}
              >
                {sourceVerses.map(verse => {
                  const isActive = !readOnly && activeVerseId === verse.verseNumber;
                  const currentTargetVerse = verses.find(v => v.verseNumber === verse.verseNumber);
                  const shouldShowTarget =
                    readOnly || isActive || revealedVerses.has(verse.verseNumber);

                  const currentContent = currentTargetVerse?.content ?? '';

                  // Ghost text: only when active, suggestion ready and not loading
                  const inlineSuggestion =
                    isActive && aiTranslation && !isAiLoading
                      ? getInlineSuggestion(currentContent, aiTranslation)
                      : '';

                  // Placeholder: empty when suggestion is available so ghost text
                  // serves as the visual hint instead
                  const placeholder = isActive
                    ? isAiLoading
                      ? 'Fetching AI suggestion...'
                      : aiTranslation
                        ? ''
                        : 'Enter translation...'
                    : 'Enter translation...';

                  return (
                    <div
                      key={verse.verseNumber}
                      ref={el => (verseRefs.current[verse.verseNumber] = el)}
                      className='grid items-start py-4'
                      style={{ gridTemplateColumns: '2rem 1fr 1fr' }}
                    >
                      <div className='flex w-8 items-start px-4'>
                        <span className='text-lg font-medium'>{verse.verseNumber}</span>
                      </div>
                      <div className='flex flex-col px-6'>
                        <div
                          className={`bg-card rounded-lg border-2 px-4 py-1 shadow-sm transition-all ${
                            isActive ? 'border-primary' : ''
                          }`}
                        >
                          <p className='min-h-12 leading-relaxed'>{verse.text}</p>
                        </div>
                      </div>

                      <div
                        className={`px-6 ${shouldShowTarget ? 'flex flex-col gap-2' : 'hidden'}`}
                      >
                        {readOnly ? (
                          <div className='bg-card flex-1 rounded-lg border-2 px-4 py-3 shadow-sm'>
                            <p className='min-h-12 leading-snug'>{currentContent}</p>
                          </div>
                        ) : (
                          <div
                            className={`flex-1 rounded-lg border-2 shadow-sm transition-all ${
                              isActive ? 'border-primary' : ''
                            } ${currentContent.trim() !== '' && !isActive ? 'bg-card' : ''}`}
                            onClick={() => handleActiveVerseChange(verse.verseNumber)}
                          >
                            <div className='relative px-4 py-1'>
                              {/*
                               * Ghost text layer:
                               * - invisible span mirrors the typed text to push
                               *   the suggestion to the correct inline position.
                               * - gray span renders the inline word completion.
                               * - "→ Tab" badge appended at the end of the ghost text
                               *   so the user sees the shortcut right at the cursor.
                               */}
                              {isActive && inlineSuggestion && (
                                <div
                                  aria-hidden
                                  className='pointer-events-none absolute inset-0 overflow-hidden px-4 py-1 text-base leading-snug break-words whitespace-pre-wrap'
                                >
                                  <span className='invisible'>{currentContent}</span>
                                  <span className='text-gray-400'>{inlineSuggestion}</span>
                                  <span className='ml-1 inline-flex items-center rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] text-gray-400 ring-1 ring-gray-300'>
                                    →Tab
                                  </span>
                                </div>
                              )}
                              <textarea
                                ref={el => (textareaRefs.current[verse.verseNumber] = el)}
                                aria-label={`Translation for verse ${verse.verseNumber}`}
                                autoCapitalize='sentences'
                                autoCorrect='on'
                                className='relative w-full resize-none border-none bg-transparent text-base leading-snug outline-none'
                                placeholder={placeholder}
                                spellCheck={true}
                                value={currentContent}
                                onChange={e => handleTextChange(verse.verseNumber, e.target.value)}
                                onFocus={() => handleActiveVerseChange(verse.verseNumber)}
                                onKeyDown={handleKeyDown}
                              />
                            </div>
                          </div>
                        )}

                        {/*
                         * AI Suggestion panel below the textarea.
                         * "Use this" now APPENDS the AI suggestion to whatever
                         * the user has already typed (with a space separator
                         * when there is existing content), rather than replacing it.
                         */}
                        {isActive && (
                          <div className='rounded-lg border border-dashed border-blue-400 bg-blue-50 px-4 py-2 text-sm text-blue-700'>
                            {isAiLoading ? (
                              <span className='flex items-center gap-2'>
                                <Loader className='h-3 w-3 animate-spin' />
                                Generating AI suggestion...
                              </span>
                            ) : aiTranslation ? (
                              <div className='flex items-start justify-between gap-2'>
                                <div className='flex-1'>
                                  <span className='font-semibold'>AI Suggestion: </span>
                                  <span>{aiTranslation}</span>
                                </div>
                                <button
                                  className='shrink-0 rounded border border-blue-400 px-2 py-0.5 text-xs font-medium hover:bg-blue-100 hover:text-blue-900 focus:ring-2 focus:ring-blue-400 focus:outline-none'
                                  onClick={() => {
                                    const separator = currentContent.trim().length > 0 ? ' ' : '';
                                    handleTextChange(
                                      verse.verseNumber,
                                      currentContent + separator + aiTranslation
                                    );
                                  }}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      const separator = currentContent.trim().length > 0 ? ' ' : '';
                                      handleTextChange(
                                        verse.verseNumber,
                                        currentContent + separator + aiTranslation
                                      );
                                    }
                                  }}
                                >
                                  Use this
                                </button>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {!readOnly && revealedVerses.size < totalSourceVerses && (
                  <div className='absolute right-4 z-10' style={{ top: buttonTop }}>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className={`bg-primary flex items-center gap-2 px-6 py-2 font-medium shadow-lg transition-all ${
                              lastRevealedVerseHasContent
                                ? 'hover:bg-primary-hover cursor-pointer text-white'
                                : 'cursor-not-allowed bg-gray-300 text-gray-500'
                            }`}
                            disabled={!lastRevealedVerseHasContent}
                            onClick={revealNextVerse}
                          >
                            Next Verse
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          align='center'
                          className='bg-popover text-popover-foreground border-border rounded-md border px-4 py-2.5 text-sm font-semibold whitespace-nowrap shadow-lg'
                          side='top'
                          sideOffset={8}
                        >
                          <div className='flex items-center gap-2'>
                            <span>Next Verse</span>
                            <span className='bg-muted text-muted-foreground flex h-5 items-center rounded border px-1.5 font-mono text-[10px]'>
                              Enter ↵
                            </span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
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
