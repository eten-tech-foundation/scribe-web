import { useState } from 'react';

import { Key, User } from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

interface ApiResponse {
  type: 'public' | 'protected';
  data: unknown;
}

export function DashboardPage(): JSX.Element {
  const { user, getAccessToken } = useAuth();
  const [accessToken, setAccessToken] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  const handleGetToken = async (): Promise<void> => {
    try {
      const token = await getAccessToken();
      setAccessToken(token);
      console.warn('Access Token:', token);
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  };

  const testPublicAPI = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:9999/api/public');
      const data: unknown = await response.json();
      setApiResponse({ type: 'public', data });
    } catch (error) {
      console.error('Error calling public API:', error);
    }
  };

  const testProtectedAPI = async (): Promise<void> => {
    try {
      const token = await getAccessToken();
      const response = await fetch('http://localhost:9999/api/protected', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data: unknown = await response.json();
      setApiResponse({ type: 'protected', data });
    } catch (error) {
      console.error('Error calling protected API:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className='mx-auto max-w-4xl'>
        <div className='rounded-lg bg-white p-8 shadow-lg'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-600'>
              {user?.picture ? (
                <img
                  alt={user.name ?? 'User'}
                  className='h-16 w-16 rounded-full'
                  src={user.picture}
                />
              ) : (
                <User className='h-8 w-8 text-white' />
              )}
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Welcome back, {user?.name ?? 'User'}!
              </h1>
              <p className='text-gray-600'>Here's your dashboard overview</p>
            </div>
          </div>

          <div className='mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6'>
            <h2 className='mb-4 flex items-center text-xl font-semibold text-gray-900'>
              <Key className='mr-2 h-5 w-5' />
              Backend API Testing
            </h2>
            <div className='space-y-4'>
              <div className='flex space-x-4'>
                <button
                  className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
                  onClick={handleGetToken}
                >
                  Get Access Token
                </button>
                <button
                  className='rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700'
                  onClick={testPublicAPI}
                >
                  Test Public API
                </button>
                <button
                  className='rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700'
                  onClick={testProtectedAPI}
                >
                  Test Protected API
                </button>
              </div>

              {accessToken && (
                <div className='rounded-lg bg-gray-100 p-4'>
                  <p className='mb-2 text-sm font-medium text-gray-700'>Access Token:</p>
                  <p className='font-mono text-xs break-all text-gray-600'>{accessToken}</p>
                </div>
              )}

              {apiResponse && (
                <div className='rounded-lg bg-gray-100 p-4'>
                  <p className='mb-2 text-sm font-medium text-gray-700'>
                    API Response ({apiResponse.type}):
                  </p>
                  <pre className='overflow-auto text-xs text-gray-600'>
                    {JSON.stringify(apiResponse.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className='rounded-lg bg-gray-50 p-6'>
            <h2 className='mb-4 text-xl font-semibold text-gray-900'>User Information</h2>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='font-medium text-gray-700'>Name:</span>
                <span className='text-gray-900'>{user?.name ?? 'Not provided'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium text-gray-700'>Email:</span>
                <span className='text-gray-900'>{user?.email}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium text-gray-700'>Email Verified:</span>
                <span className='text-gray-900'>{user?.email_verified ? 'Yes' : 'No'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium text-gray-700'>User ID:</span>
                <span className='font-mono text-sm text-gray-900'>
                  {user?.sub ?? 'Not available'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
