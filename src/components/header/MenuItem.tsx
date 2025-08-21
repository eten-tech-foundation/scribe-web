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
          ? 'bg-gray-50 text-gray-700 hover:text-gray-900'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
      variant='ghost'
      onClick={handleClick}
    >
      <span className='mr-3 text-gray-500'>{icon}</span>
      <span className='text-sm font-medium'>{text}</span>
    </Button>
  );
};

export default MenuItem;
