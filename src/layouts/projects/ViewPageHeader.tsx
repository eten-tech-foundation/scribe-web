import { useNavigate } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

interface ViewPageHeaderProps {
  title: string;
  onBack?: () => void;
}

export const ViewPageHeader: React.FC<ViewPageHeaderProps> = ({ title, onBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate({ to: '/projects' });
    }
  };

  return (
    <div className='mb-6 flex items-center gap-4'>
      <ChevronLeft
        className='cursor-pointer'
        size={'30px'}
        strokeWidth={'2px'}
        onClick={handleBack}
      />
      <h1 className='text-foreground text-4xl font-semibold'>{title}</h1>
    </div>
  );
};
