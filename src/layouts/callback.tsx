import { useEffect } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useAuth } from '@/hooks/useAuth';

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
        console.error('Auth0 error:', error);
        navigate({ to: '/' });
      }
    }
  }, [isAuthenticated, isLoading, error, navigate]);

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      <div className='text-center'>
        <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
        <h2 className='mb-2 text-xl font-semibold text-gray-900'>Completing sign-in...</h2>
        <p className='text-gray-600'>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
