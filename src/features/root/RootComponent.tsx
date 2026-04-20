import { useEffect, useState } from 'react';

import { Outlet, useLocation, useNavigate, useSearch } from '@tanstack/react-router';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import Header from '@/features/header/components';
import { EditProfile } from '@/features/profile/components/EditProfile';
import { SettingsModal } from '@/features/root/SettingsModal';
import { useAuth } from '@/hooks/useAuth';
import { useGetUserDetailsMutation, useUpdateUser } from '@/hooks/useUsers';
import { Logger } from '@/lib/services/logger';
import { type User } from '@/lib/types';
import { useAppStore } from '@/store/store';

const PUBLIC_ROUTES = ['/legal/privacy', '/legal/terms'];

export function LoadingScreen({ message }: { message: string }) {
  return (
    <ErrorBoundary>
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600' />
          <p className='text-lg text-gray-600 dark:text-gray-400'>{message}</p>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export function RootComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { modal } = useSearch({ from: '__root__' });
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth();
  const { mutate: fetchUserDetails, isPending: isFetchingUserDetails } =
    useGetUserDetailsMutation();
  const updateUserMutation = useUpdateUser();
  const { setUserDetail } = useAppStore();

  const [userDetailsFetched, setUserDetailsFetched] = useState(false);
  const [fetchInitiated, setFetchInitiated] = useState(false);

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  const handleModalClose = () => {
    void navigate({
      to: location.pathname,
      search: { modal: undefined },
      replace: true,
    });
  };

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

  useEffect(() => {
    if (isPublicRoute) return;

    if (!isLoading && !isAuthenticated) {
      Logger.logEvent('AuthenticationRequired', {
        timestamp: new Date().toISOString(),
        currentUrl: window.location.href,
      });
      void loginWithRedirect({
        appState: { returnTo: window.location.pathname + window.location.search },
      });
    } else if (isAuthenticated && user?.email && !fetchInitiated) {
      Logger.logEvent('UserAuthenticated', {
        userId: user.sub,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
      });

      setFetchInitiated(true);

      fetchUserDetails(user.email, {
        onSuccess: userDetails => {
          void (async () => {
            if (userDetails.status !== 'verified' && user.email_verified) {
              userDetails.status = 'verified';
              await updateUserMutation.mutateAsync({
                userData: userDetails as User,
                email: userDetails.email,
              });
            }
            setUserDetail({
              id: userDetails.id,
              email: userDetails.email,
              username: userDetails.username,
              role: userDetails.role,
              organization: userDetails.organization,
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
              status: userDetails.status,
            });
            setUserDetailsFetched(true);
          })();
        },
        onError: error => {
          Logger.logException(error instanceof Error ? error : new Error(String(error)), {
            source: 'FetchUserDetails',
            userEmail: user.email,
          });
          setFetchInitiated(false);
          setUserDetailsFetched(false);
          void loginWithRedirect({
            appState: { returnTo: window.location.pathname + window.location.search },
          });
        },
      });
    }
  }, [
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    user,
    fetchUserDetails,
    setUserDetail,
    fetchInitiated,
    updateUserMutation,
    isPublicRoute,
  ]);

  if (isPublicRoute) {
    return (
      <ErrorBoundary>
        <div className='flex h-screen flex-col overflow-hidden'>
          <Header />
          <main className='flex-1 overflow-hidden p-4'>
            <Outlet />
          </main>
        </div>
      </ErrorBoundary>
    );
  }

  if (isLoading) return <LoadingScreen message='Loading...' />;
  if (!isAuthenticated) return <LoadingScreen message='Redirecting to login...' />;
  if (isFetchingUserDetails || !userDetailsFetched)
    return <LoadingScreen message='Loading user details...' />;

  return (
    <ErrorBoundary>
      <div className='flex h-screen flex-col overflow-hidden'>
        <Header />
        <main className='flex-1 overflow-hidden p-4'>
          <Outlet />
          <SettingsModal isOpen={modal === 'settings'} onClose={handleModalClose} />
          <EditProfile isOpen={modal === 'profile'} onClose={handleModalClose} />
        </main>
      </div>
    </ErrorBoundary>
  );
}
