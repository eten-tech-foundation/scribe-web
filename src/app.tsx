import { useEffect } from 'react';

import { Outlet } from '@tanstack/react-router';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { useGetUserDetailsMutation } from '@/hooks/useUsers';
import Header from '@/layouts/header';
import { Logger } from '@/lib/services/logger';
import { useAppStore } from '@/store/store';

export function App() {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth();
  const { mutate: fetchUserDetails } = useGetUserDetailsMutation();
  const { setUserDetail } = useAppStore();

  useEffect(() => {
    Logger.logEvent('AppStarted', {
      startTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    const handleGlobalError = (event: ErrorEvent) => {
      Logger.logException(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        source: 'GlobalErrorHandler',
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      Logger.logException(error, {
        source: 'UnhandledPromiseRejection',
        reason: String(event.reason),
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  // Handle authentication redirect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Log the authentication attempt
      Logger.logEvent('AuthenticationRequired', {
        timestamp: new Date().toISOString(),
        currentUrl: window.location.href,
      });

      // Redirect to Auth0 login
      void loginWithRedirect({
        appState: {
          returnTo: window.location.pathname + window.location.search,
        },
      });
    } else if (isAuthenticated && user?.email) {
      // Log successful authentication
      Logger.logEvent('UserAuthenticated', {
        userId: user.sub,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
      });
      // Fetch user details
      fetchUserDetails(user.email, {
        onSuccess: userDetails => {
          setUserDetail({
            id: typeof userDetails.id === 'number' ? userDetails.id : 0,
            email: userDetails.email || '',
            username: userDetails.username || '',
            role: typeof userDetails.role === 'number' ? userDetails.role : 0,
            organization:
              typeof userDetails.organization === 'number' ? userDetails.organization : 0,
          });
        },
        onError: error => {
          console.error('Failed to fetch user details:', error);
        },
      });
    }
  }, [isAuthenticated, isLoading, loginWithRedirect, user, fetchUserDetails, setUserDetail]);

  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className='flex min-h-screen items-center justify-center bg-gray-50'>
          <div className='text-center'>
            <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
            <p className='text-lg text-gray-600'>Loading...</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <div className='flex min-h-screen items-center justify-center bg-gray-50'>
          <div className='text-center'>
            <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
            <p className='text-lg text-gray-600'>Redirecting to login...</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Header />
      <main className='p-4'>
        <Outlet />
      </main>
    </ErrorBoundary>
  );
}
