import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { ChevronRight } from 'lucide-react';

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
  saveVerse: (id: number, text: string) => void;
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
  saveVerse,
  onScroll,
}) => {
  const textareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [translatedText, setTranslatedText] = useState('');

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(48, textarea.scrollHeight) + 'px';
  };

  const handleVerseClick = (verseId: number) => {
    const verse = verses.find(v => v.verseNumber === verseId);
    if (verse) {
      setActiveVerseId(verseId);
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
    setTranslatedText(text);

    const textarea = textareaRefs.current[verseId];
    if (textarea) {
      autoResizeTextarea(textarea);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    const textarea = textareaRefs.current[activeVerseId];
    if (textarea) {
      textarea.focus();
      autoResizeTextarea(textarea);
    }
  }, [activeVerseId]);

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
      <div className='bg-background sticky top-0 z-10 px-6 py-4'>
        <h3 className='text-xl font-bold text-gray-800'>{targetLanguage}</h3>
      </div>

      <div
        ref={scrollRef}
        className='bg-card flex-1 overflow-auto rounded-md border border-gray-200 p-2'
        style={{ scrollbarWidth: 'thin' }}
        onScroll={handleScroll}
      >
        <div className='space-y-4 pb-6'>
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
                    className={`min-h-[80px] cursor-pointer rounded-lg border p-4 shadow-sm transition-all ${
                      isActive ? 'bg-background' : 'bg-card'
                    }`}
                    onClick={() => handleVerseClick(verseId)}
                  >
                    <textarea
                      ref={el => (textareaRefs.current[verseId] = el)}
                      className='w-full resize-none overflow-hidden border-none bg-transparent text-sm leading-relaxed text-gray-800 outline-none'
                      placeholder='Enter translation...'
                      style={{ minHeight: 'auto', height: 'auto' }}
                      value={TargetVerse.content}
                      onChange={e => handleTextChange(verseId, e.target.value)}
                      onFocus={() => {
                        setActiveVerseId(verseId);
                      }}
                      onKeyDown={e => handleKeyDown(e)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {verses.length < totalSourceVerses && (
          <div className='sticky bottom-6 flex justify-end pb-6'>
            <button
              className={`flex items-center gap-2 rounded px-6 py-2 font-medium shadow-lg transition-all ${
                verses.find(v => v.verseNumber === activeVerseId)?.content.trim()
                  ? 'cursor-pointer bg-cyan-600 text-white hover:bg-cyan-700'
                  : 'cursor-not-allowed bg-gray-300 text-gray-500'
              }`}
              disabled={!verses.find(v => v.verseNumber === activeVerseId)?.content.trim()}
              title='Enter'
              onClick={() => {
                moveToNextVerse();
                saveVerse(activeVerseId, translatedText);
              }}
            >
              Next Verse
              <ChevronRight className='h-4 w-4' />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
