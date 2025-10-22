// ResourceComponents.tsx
import { useEffect, useRef, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type ItemWithUrl, type ProjectItem, type ResourceName } from '@/lib/types';
import { getPublisherName } from '@/lib/utils';

// ResourceDropdown Component
export const ResourceDropdown = ({
  selectedResource,
  resourceNames,
  onSelect,
}: {
  selectedResource: ResourceName;
  resourceNames: ResourceName[];
  onSelect: (resource: ResourceName) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (resource: ResourceName) => {
    onSelect(resource);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className='relative mt-2'>
      <button
        aria-expanded={isOpen}
        aria-haspopup='listbox'
        aria-label='Resource type'
        className='hover:bg-muted flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-semibold'
        type='button'
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedResource.name}</span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className='absolute z-20 mt-1 w-full rounded-md border bg-white shadow-lg'>
          <ul className='max-h-60 overflow-auto py-1' role='listbox'>
            {resourceNames.map((resource, index) => (
              <li
                key={index}
                aria-selected={resource.name === selectedResource.name}
                className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${
                  resource.name === selectedResource.name ? 'bg-gray-50 font-medium' : ''
                }`}
                role='option'
                onClick={() => handleSelect(resource)}
              >
                {resource.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ImageGrid Component
export const ImageGrid = ({
  items,
  sourceData,
  activeVerseId,
  onImageClick,
}: {
  items: ItemWithUrl[];
  sourceData: ProjectItem;
  activeVerseId: number;
  onImageClick: (item: ItemWithUrl) => void;
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.style.display = 'none';
    if (target.parentElement) {
      target.parentElement.innerHTML = '<div class="text-gray-400 text-sm">No preview</div>';
    }
  };

  return (
    <>
      <span className='px-1 text-xl font-semibold'>
        {sourceData.book} {sourceData.chapterNumber}:{activeVerseId}
      </span>
      <div className='grid grid-cols-1 gap-3 py-4 sm:grid-cols-2'>
        {items.map(item => (
          <div
            key={item.id}
            className='cursor-pointer overflow-hidden rounded-lg border border-gray-200 hover:shadow-lg'
            onClick={() => onImageClick(item)}
          >
            <div className='flex aspect-video items-center justify-center bg-gray-100'>
              <img
                alt={item.localizedName}
                className='h-full w-full object-contain'
                src={item.thumbnailUrl}
                onError={handleImageError}
              />
            </div>
            <div className='p-2'>
              <h4 className='text-xs font-semibold text-blue-600 hover:text-blue-800'>
                {item.localizedName} ({getPublisherName(item.grouping)})
              </h4>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// ImageDialog Component
export const ImageDialog = ({
  image,
  onClose,
}: {
  image: ItemWithUrl | null;
  onClose: () => void;
}) => {
  return (
    <Dialog open={!!image} onOpenChange={onClose}>
      <DialogContent className='w-full max-w-[95vw] p-6'>
        <DialogHeader>
          <DialogTitle>{image?.localizedName}</DialogTitle>
        </DialogHeader>
        <div className='flex items-center justify-center overflow-hidden'>
          <img
            alt={image?.localizedName}
            className='h-auto max-h-[85vh] w-auto max-w-full rounded-lg object-contain'
            src={image?.url}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
