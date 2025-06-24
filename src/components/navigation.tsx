import { useEffect } from 'react';

import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { UserProfile } from '@/components/auth/UserProfile';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/hooks/useAuth';

export const Navigation = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user, login } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log('Auth Debug:', {
      isAuthenticated,
      isLoading,
      user: user ? { email: user.email, name: user.name } : null,
    });
  }, [isAuthenticated, isLoading, user]);

  const handleSignIn = () => {
    login();
  };

  return (
    <div className='flex items-center gap-6'>
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

      {isAuthenticated && (
        <Link
          activeProps={{ className: 'text-foreground font-bold hover:text-primary' }}
          className='text-foreground hover:text-primary flex items-center font-medium'
          to='/dashboard'
        >
          Dashboard
        </Link>
      )}

      <div className='flex items-center gap-2'>
        <ThemeToggle />
        {isLoading ? (
          <div className='h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600'></div>
        ) : isAuthenticated ? (
          <UserProfile />
        ) : (
          <button
            className='rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700'
            onClick={handleSignIn}
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};
