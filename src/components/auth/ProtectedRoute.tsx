import { type ReactNode, useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login().catch(error => {
        console.error('Auto-login failed:', error);
      });
    }
  }, [isAuthenticated, isLoading, login]);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
