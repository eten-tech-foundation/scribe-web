import type React from 'react';
import { useEffect, useRef } from 'react';

import type { Source } from './DraftingPage';

interface SourcePanelProps {
  verses: Source[];
  bibleName: string;
  activeVerseId: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll: (scrollTop: number) => void;
}

export const SourcePanel: React.FC<SourcePanelProps> = ({
  verses,
  bibleName,
  activeVerseId,
  scrollRef,
  onScroll,
}) => {
  const textareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(20, textarea.scrollHeight) + 'px';
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    verses.forEach(verse => {
      const textarea = textareaRefs.current[verse.verseNumber];
      if (textarea) {
        autoResizeTextarea(textarea);
      }
    });
  }, [verses]);

  return (
    <div className='flex h-full flex-col'>
      <div className='bg-background sticky top-0 z-10 ml-8 px-6 py-4'>
        <h3 className='text-xl font-bold text-gray-800'>{bibleName}</h3>
      </div>

      <div
        ref={scrollRef}
        className='scrollbar-hide flex-1 overflow-hidden px-6 pt-2'
        style={{
          overflowY: 'scroll',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onScroll={handleScroll}
      >
        <div className='space-y-4 pb-6'>
          {verses.map(verse => {
            const isActive = activeVerseId === verse.verseNumber;

            return (
              <div
                key={verse.verseNumber}
                className={`flex items-start transition-all ${isActive ? 'opacity-100' : 'opacity-70'}`}
              >
                <div className='w-8 flex-shrink-0'>
                  <span className='text-lg font-medium text-gray-700'>{verse.verseNumber}</span>
                </div>
                <div className='flex-1'>
                  <div className='bg-card rounded-lg border px-4 py-1 shadow-sm transition-all'>
                    <textarea
                      ref={el => (textareaRefs.current[verse.verseNumber] = el)}
                      readOnly
                      className='h-auto min-h-[20px] w-full resize-none content-center overflow-hidden border-none bg-transparent text-base leading-relaxed leading-snug text-gray-800 outline-none'
                      value={verse.text}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
