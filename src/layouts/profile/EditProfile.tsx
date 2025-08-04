import { User } from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export function EditProfile() {
  const { user } = useAuth();

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
              {/* <p className='text-gray-600'>Here's your dashboard overview</p> */}
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
