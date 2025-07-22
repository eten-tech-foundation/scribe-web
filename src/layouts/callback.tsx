import { useEffect } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useAuth } from '@/hooks/useAuth';
import logger from '@/lib/error-logger';

export function CallbackPage() {
  const { isAuthenticated, isLoading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect to home page on successful authentication
        navigate({ to: '/' });
      } else if (error) {
        // Handle error - redirect to home instead of login to avoid loop
        logger.error(error as Error, 'CallbackPage', 'Auth0');
        navigate({ to: '/' });
      }
    }
  }, [isAuthenticated, isLoading, error, navigate]);

  return (
    <div className='dark:bg-background flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:bg-none'>
      <div className='dark:bg-background text-center dark:text-white'>
        <div className='dark:bg-background mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 dark:text-white'></div>
        <h2 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white'>
          Completing sign-in...
        </h2>
        <p className='text-gray-600 dark:text-white'>
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
}
