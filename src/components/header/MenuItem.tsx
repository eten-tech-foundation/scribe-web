import React from 'react';

import { Button } from '@/components/ui/button';

interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
  onClosePopover?: () => void;
  isActive?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  text,
  onClick,
  onClosePopover,
  isActive = false,
}) => {
  const handleClick = () => {
    onClick();
    onClosePopover?.();
  };

  return (
    <Button
      className={`h-10 w-full cursor-pointer justify-start px-4 py-2 transition-colors duration-150 ${
        isActive
          ? 'hover:bg-popover-hover text-text-primary dark:bg-background border-white bg-white'
          : 'hover:bg-popover-hover text-text-primary'
      }`}
      variant='ghost'
      onClick={handleClick}
    >
      <span className='text-text-primary mr-3'>{icon}</span>
      <span className='text-sm font-medium'>{text}</span>
    </Button>
  );
};

export default MenuItem;
