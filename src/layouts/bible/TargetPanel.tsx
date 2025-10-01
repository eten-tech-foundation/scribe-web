import type React from 'react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';

import type { TargetVerse } from './DraftingPage';

interface TargetPanelProps {
  verses: TargetVerse[];
  targetLanguage: string;
  setVerses: React.Dispatch<React.SetStateAction<TargetVerse[]>>;
  activeVerseId: number;
  setActiveVerseId: (id: number) => void;
  totalSourceVerses: number;
  updateVerse: (id: number, text: string) => void;
  moveToNextVerse: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll: (scrollTop: number) => void;
}

export const TargetPanel: React.FC<TargetPanelProps> = ({
  verses,
  targetLanguage,
  setVerses,
  activeVerseId,
  setActiveVerseId,
  totalSourceVerses,
  updateVerse,
  moveToNextVerse,
  scrollRef,
  onScroll,
}) => {
  const textareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(20, textarea.scrollHeight) + 'px';
  };

  const handleVerseClick = async (verseId: number) => {
    const verse = verses.find(v => v.verseNumber === verseId);
    if (verse) {
      await setActiveVerseId(verseId);
      setTimeout(() => {
        const textarea = textareaRefs.current[verseId];
        if (textarea) {
          textarea.focus();
        }
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      moveToNextVerse();
    }
  };

  const handleTextChange = (verseId: number, text: string) => {
    updateVerse(verseId, text);

    const textarea = textareaRefs.current[verseId];
    if (textarea) {
      autoResizeTextarea(textarea);
    }
  };

  const handleFocus = async (verseId: number) => {
    await setActiveVerseId(verseId);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    const activeVerseElement = verseRefs.current[activeVerseId];
    const textarea = textareaRefs.current[activeVerseId];

    if (activeVerseElement && scrollRef.current) {
      const container = scrollRef.current;
      const verseTop = activeVerseElement.offsetTop;
      const verseHeight = activeVerseElement.offsetHeight;
      const containerHeight = container.clientHeight;
      const currentScroll = container.scrollTop;

      if (verseTop < currentScroll || verseTop + verseHeight > currentScroll + containerHeight) {
        container.scrollTo({
          top: verseTop - containerHeight / 2 + verseHeight / 2,
          behavior: 'smooth',
        });
      }
    }

    if (textarea) {
      textarea.focus();
      autoResizeTextarea(textarea);
    }
  }, [activeVerseId, scrollRef]);

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

  return (
    <div className='flex h-full flex-col'>
      <div className='bg-background sticky top-0 z-10 py-4'>
        <h3 className='text-xl font-bold text-gray-800'>{targetLanguage}</h3>
      </div>

      <div
        ref={scrollRef}
        className='bg-muted h-full overflow-auto rounded-md border border-gray-200 p-2'
        style={{ scrollbarWidth: 'thin' }}
        onScroll={handleScroll}
      >
        <div className={`space-y-4 ${verses.length < totalSourceVerses ? 'pb-48' : 'pb-6'}`}>
          {Array.from({ length: totalSourceVerses }, (_, index) => {
            const verseId = index + 1;
            const TargetVerse = verses.find(kv => kv.verseNumber === verseId);
            const isActive = activeVerseId === verseId;

            return (
              <div
                key={verseId}
                ref={el => (verseRefs.current[verseId] = el)}
                className='transition-all'
              >
                {TargetVerse && (
                  <div
                    className={`flex items-start transition-all ${isActive ? 'opacity-100' : 'opacity-90'}`}
                  >
                    <div className='flex-1'>
                      <div
                        className={`${isActive ? 'bg-background' : 'bg-card'} cursor-pointer rounded-lg border px-4 py-1 shadow-sm transition-all`}
                        onClick={() => handleVerseClick(verseId)}
                      >
                        <textarea
                          ref={el => (textareaRefs.current[verseId] = el)}
                          className='h-auto min-h-[20px] w-full resize-none content-center overflow-hidden border-none bg-transparent text-base leading-relaxed leading-snug text-gray-800 outline-none'
                          placeholder='Enter translation...'
                          value={TargetVerse.content}
                          onChange={e => handleTextChange(verseId, e.target.value)}
                          onFocus={() => handleFocus(verseId)}
                          onKeyDown={e => handleKeyDown(e)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {verses.length < totalSourceVerses && (
            <div className='flex justify-end'>
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
  );
};
