import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Logger } from '@/lib/services/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Logger.logException(error, {
      componentStack: errorInfo.componentStack ?? '',
      errorBoundary: 'ErrorBoundary',
      errorInfo: JSON.stringify(errorInfo),
    });
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='flex min-h-screen items-center justify-center bg-gray-50'>
          <div className='max-w-md rounded-lg bg-white p-6 shadow-lg'>
            <h1 className='mb-4 text-xl font-bold text-red-600'>Something went wrong</h1>
            <p className='mb-4 text-gray-700'>
              We're sorry, but something unexpected happened. The error has been logged and we'll
              look into it.
            </p>
            <button
              className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
