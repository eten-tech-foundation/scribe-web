import { useState } from 'react';

import { Key, User } from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import logger from '@/lib/error-logger';

export function HomePage() {
  const { user, getAccessToken } = useAuth();
  const [accessToken, setAccessToken] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<any>(null);

  const handleGetToken = async () => {
    try {
      const token = await getAccessToken();
      setAccessToken(token);
    } catch (error) {
      logger.error(error as Error, 'Test');
    }
  };

  const testPublicAPI = async () => {
    try {
      const response = await fetch('http://localhost:9999/api/public');
      const data = await response.json();
      setApiResponse({ type: 'public', data });
    } catch (error) {
      logger.error(error as Error, 'TestPublicAPI', 'testPublicAPI');
    }
  };

  const testProtectedAPI = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch('http://localhost:9999/api/protected', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setApiResponse({ type: 'protected', data });
    } catch (error) {
      logger.error(error as Error, 'TestProtectedAPI', 'testProtectedAPI');
    }
  };

  return (
    <ProtectedRoute>
      <div className='dark:bg-background mx-auto max-w-4xl dark:text-white'>
        <div className='dark:bg-background rounded-lg bg-white p-8 shadow-lg dark:text-white'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-600'>
              {user?.picture ? (
                <img
                  alt={user.name || 'User'}
                  className='h-16 w-16 rounded-full'
                  src={user.picture}
                />
              ) : (
                <User className='h-8 w-8 text-white' />
              )}
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className='text-gray-600 dark:text-white'>Here's your dashboard overview</p>
            </div>
          </div>

          <div className='dark:bg-background mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:text-white'>
            <h2 className='mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white'>
              <Key className='mr-2 h-5 w-5' />
              Backend API Testing
            </h2>
            <div className='space-y-4'>
              <div className='flex space-x-4'>
                <button
                  className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:text-white'
                  onClick={handleGetToken}
                >
                  Get Access Token
                </button>
                <button
                  className='rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 dark:bg-green-600 dark:text-white'
                  onClick={testPublicAPI}
                >
                  Test Public API
                </button>
                <button
                  className='rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 dark:bg-red-600 dark:text-white'
                  onClick={testProtectedAPI}
                >
                  Test Protected API
                </button>
              </div>

              {accessToken && (
                <div className='dark:bg-background rounded-lg bg-gray-100 p-4 dark:text-white'>
                  <p className='mb-2 text-sm font-medium text-gray-700 dark:text-white'>
                    Access Token:
                  </p>
                  <p className='font-mono text-xs break-all text-gray-600 dark:text-white'>
                    {accessToken}
                  </p>
                </div>
              )}

              {apiResponse && (
                <div className='dark:bg-background rounded-lg bg-gray-100 p-4 dark:text-white'>
                  <p className='mb-2 text-sm font-medium text-gray-700 dark:text-white'>
                    API Response ({apiResponse.type}):
                  </p>
                  <pre className='overflow-auto text-xs text-gray-600 dark:text-white'>
                    {JSON.stringify(apiResponse.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className='dark:bg-background rounded-lg bg-gray-50 p-6 dark:border dark:border-gray-700 dark:text-white'>
            <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
              User Information
            </h2>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='font-medium text-gray-700 dark:text-white'>Name:</span>
                <span className='text-gray-900 dark:text-white'>
                  {user?.name || 'Not provided'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium text-gray-700 dark:text-white'>Email:</span>
                <span className='text-gray-900 dark:text-white'>{user?.email}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium text-gray-700 dark:text-white'>Email Verified:</span>
                <span className='text-gray-900 dark:text-white'>
                  {user?.email_verified ? 'Yes' : 'No'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium text-gray-700 dark:text-white'>User ID:</span>
                <span className='font-mono text-sm text-gray-900 dark:text-white'>
                  {user?.sub || 'Not available'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
