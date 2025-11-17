// ResourceComponents.tsx
import { useEffect, useRef, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { type ResourceName } from '@/lib/types';

export const ResourceDropdown = ({
  selectedResource,
  resourceNames,
  onSelect,
  disabled,
}: {
  disabled?: boolean;
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
  console.log(disabled, 'disabled prop in ResourceDropdown');
  return (
    <div ref={dropdownRef} className='relative mt-2'>
      <button
        aria-expanded={isOpen}
        aria-haspopup='listbox'
        aria-label='Resource type'
        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-semibold ${
          disabled
            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
            : 'hover:bg-muted cursor-pointer'
        }`}
        disabled={disabled} // native HTML disable
        type='button'
        onClick={() => !disabled && setIsOpen(!isOpen)} // prevent toggle when disabled
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
