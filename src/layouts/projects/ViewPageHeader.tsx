import React, { useLayoutEffect, useRef, useState } from 'react';

import { ChevronLeft } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ViewPageHeaderProps {
  title: string;
  onBack?: () => void;
  rightContent?: React.ReactNode;
}

export const ViewPageHeader: React.FC<ViewPageHeaderProps> = ({ title, onBack, rightContent }) => {
  const textRef = useRef<HTMLHeadingElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [title]);

  const headerContent = (
    <h1
      ref={textRef}
      className='text-foreground max-w-[80%] cursor-default truncate text-2xl font-semibold sm:text-2xl lg:text-3xl'
    >
      {title}
    </h1>
  );

  return (
    <div className='mb-4 flex items-center justify-between gap-3 sm:mb-6 sm:gap-4'>
      <div className='flex min-w-0 flex-1 items-center gap-3 sm:gap-4'>
        <ChevronLeft
          className='flex-shrink-0 cursor-pointer'
          size={'24px'}
          strokeWidth={'2px'}
          onClick={onBack}
        />

        {isTruncated ? (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                {/* We wrap in the Trigger so hovering the truncated text shows the tooltip */}
                {headerContent}
              </TooltipTrigger>
              <TooltipContent
                align='center'
                className='bg-popover text-popover-foreground border-border z-50 max-w-[500px] rounded-md border px-4 py-2.5 text-sm font-semibold break-words shadow-lg'
                side='bottom'
                sideOffset={8}
              >
                {title}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          headerContent
        )}
      </div>
      {rightContent && <div className='flex flex-shrink-0 items-center gap-2'>{rightContent}</div>}
    </div>
  );
};
