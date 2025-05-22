import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { ThemeToggle } from '@/components/ui/theme-toggle';

export const Navigation = () => {
  const { t } = useTranslation();
  return (
    <div className='flex gap-6'>
      <Link
        activeProps={{ className: 'text-foreground font-bold hover:text-primary' }}
        className='text-foreground hover:text-primary flex items-center font-medium'
        to='/'
      >
        {t(`home`)}
      </Link>
      <Link
        activeProps={{ className: 'text-foreground font-bold hover:text-primary' }}
        className='text-foreground hover:text-primary flex items-center font-medium'
        to='/about'
      >
        {t(`about`)}
      </Link>
      <Link
        activeProps={{ className: 'text-foreground font-bold hover:text-primary' }}
        className='text-foreground hover:text-primary flex items-center font-medium'
        to='/tailwind-test'
      >
        {t(`tailwind`)}
      </Link>
      <div className='flex items-center gap-2'>
        <ThemeToggle />
      </div>
    </div>
  );
};
