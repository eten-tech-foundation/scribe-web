import { useCallback } from 'react';

import { useMatch, useNavigate } from '@tanstack/react-router';
import { ChevronLeft, Loader } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAddTranslatedVerse, useSubmitChapter } from '@/hooks/useBibleTarget';
import { type DraftingUIProps } from '@/lib/types';
import { useAppStore } from '@/store/store';

import { useDrafting } from '../../hooks/useDrafting';

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

  const saveVerse = useCallback(
    async (verse: number, text: string) => {
      const sourceVerse = sourceVerses.find(v => v.verseNumber === verse);
      if (!sourceVerse) {
        console.error(`Source verse not found for verse ${verse}`);
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
  } = useDrafting({ sourceVerses, targetVerses, readOnly, onSave: saveVerse });

  const { setActiveTab } = useAppStore();

  const handleBack = () => {
    setActiveTab('my-history');
    void navigate({ to: '/' });
  };
  const totalSourceVerses = sourceVerses.length;
  const versesWithText = verses.filter(v => v.content.trim() !== '').length;
  const progressPercentage = (versesWithText / totalSourceVerses) * 100;
  const isTranslationComplete = versesWithText === totalSourceVerses;

  const isAnythingSaving = !readOnly && verses.some(v => getSaveStatus(v.verseNumber).showLoader);
  const hasAnyError = !readOnly && verses.some(v => getSaveStatus(v.verseNumber).hasRetryScheduled);

  const handleSubmit = async () => {
    if (readOnly || !isTranslationComplete) return;
    const savePromises = verses
      .filter(verse => getSaveStatus(verse.verseNumber).hasUnsavedChanges)
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
