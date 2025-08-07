import React from 'react';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-5 backdrop-grayscale backdrop-opacity-90'>
      <div className='bg-popover text-popover-foreground relative h-165 w-full max-w-md rounded-lg p-6'>
        <Button
          aria-label='Close modal'
          className='absolute top-0 right-0 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          onClick={onClose}
        >
          <X className='h-6 w-6' />
        </Button>
        <div className='flex h-full flex-col justify-between'>
          <div className='pt-4'>
            <h2 className='text-xl font-semibold'>{title}</h2>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};
