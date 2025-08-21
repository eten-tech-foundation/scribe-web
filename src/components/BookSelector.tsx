'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { bibleBooks } from './CreateProjectModal'; // your export, unchanged

interface BibleBookMultiSelectPopoverProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  maxVisibleNames?: number; // default 3
}

export function BibleBookMultiSelectPopover({
  value,
  onChange,
  placeholder = 'Select book(s)',
  maxVisibleNames = 3,
}: BibleBookMultiSelectPopoverProps) {
  const [open, setOpen] = useState(false);

  // Measure a wrapper so the content width exactly matches the trigger
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperWidth, setWrapperWidth] = useState<number>(0);

  useEffect(() => {
    const update = () => {
      if (wrapperRef.current) {
        // exact pixel width including border/padding due to box-border
        setWrapperWidth(wrapperRef.current.getBoundingClientRect().width);
      }
    };
    update();

    const ro = new ResizeObserver(update);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    window.addEventListener('resize', update);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const selectedLabels = useMemo(
    () => bibleBooks.filter(b => value.includes(b.value)).map(b => b.label),
    [value]
  );

  const displayText =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length <= maxVisibleNames
        ? selectedLabels.join(', ')
        : `${selectedLabels.slice(0, maxVisibleNames).join(', ')} +${
            selectedLabels.length - maxVisibleNames
          } more`;

  const toggleBook = (bookValue: string) => {
    if (value.includes(bookValue)) {
      onChange(value.filter(v => v !== bookValue));
    } else {
      onChange([...value, bookValue]);
    }
  };

  return (
    <div ref={wrapperRef} className='w-full'>
      <Popover open={open} onOpenChange={setOpen}>
        {/* Trigger */}
        <PopoverTrigger className='box-border flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-left text-sm'>
          <span
            className={selectedLabels.length === 0 ? 'text-muted-foreground truncate' : 'truncate'}
          >
            {displayText}
          </span>
          <ChevronDown className='ml-2 h-4 w-4 shrink-0' />
        </PopoverTrigger>

        {/* Content (width exactly matches wrapper/trigger) */}
        <PopoverContent
          align='start'
          className='text-popover-foreground rounded-md border bg-white p-0 shadow-md'
          side='top'
          style={{
            width: wrapperWidth ? `${Math.round(wrapperWidth)}px` : undefined,
            boxSizing: 'border-box',
          }}
        >
          <div className='max-h-82 overflow-y-auto py-1 [scrollbar-gutter:stable]'>
            {bibleBooks.map(book => {
              const checked = value.includes(book.value);
              return (
                <label
                  key={book.value}
                  className={`hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm ${
                    checked ? 'bg-accent/40' : ''
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    className='h-4 w-4'
                    onCheckedChange={() => toggleBook(book.value)}
                  />
                  <span className='truncate'>{book.label}</span>
                </label>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
