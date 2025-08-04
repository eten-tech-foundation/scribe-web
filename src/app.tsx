import { useEffect } from 'react';

import { Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Logger } from '@/lib/services/logger';

import { Navigation } from './components/navigation';

export function App() {
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

  return (
    <ErrorBoundary>
      <div className='min-h-screen'>
        <header className='bg-primary text-primary-foreground px-6 py-4 shadow-md'>
          <div className='container mx-auto flex items-center justify-between'>
            <h1 className='text-xl font-bold'>Scribe Web</h1>
            <Navigation />
          </div>
          <LanguageSelector />
        </header>

        <main className='container mx-auto px-4 py-8'>
          <Outlet />
        </main>

        <footer className='bg-secondary text-secondary-foreground mt-8 px-6 py-4'>
          <div className='container mx-auto text-center'>
            <p>&copy; {new Date().getFullYear()}</p>
          </div>
        </footer>

        {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
      </div>
    </ErrorBoundary>
  );
}
