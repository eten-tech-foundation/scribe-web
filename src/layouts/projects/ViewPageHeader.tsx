import { ChevronLeft } from 'lucide-react';

interface ViewPageHeaderProps {
  title: string;
  onBack?: () => void;
}

export const ViewPageHeader: React.FC<ViewPageHeaderProps> = ({ title, onBack }) => {
  return (
    <div className='mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4'>
      <ChevronLeft
        className='flex-shrink-0 cursor-pointer'
        size={'24px'}
        strokeWidth={'2px'}
        onClick={onBack}
      />
      <h1
        className='text-foreground max-w-[80%] truncate text-2xl font-semibold sm:text-2xl lg:text-3xl'
        title={title}
      >
        {title}
      </h1>
    </div>
  );
};
