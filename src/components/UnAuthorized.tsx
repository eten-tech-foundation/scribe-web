import { Shield, AlertCircle } from 'lucide-react';

export default function UnauthorizedPage() {
  const handleGoBack = () => {
    window.location.href = '/';
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 p-4'>
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute top-20 left-10 h-20 w-32 rounded-full bg-blue-100 opacity-30 blur-xl'></div>
        <div className='absolute top-40 right-20 h-24 w-40 rounded-full bg-blue-200 opacity-20 blur-xl'></div>
        <div className='absolute bottom-32 left-1/4 h-28 w-36 rounded-full bg-blue-100 opacity-25 blur-xl'></div>
        <div className='absolute right-1/3 bottom-20 h-20 w-28 rounded-full bg-blue-200 opacity-30 blur-xl'></div>
      </div>

      <div className='z-10 mx-auto max-w-md text-center'>
        <h1 className='mb-4 text-8xl font-bold tracking-tight text-blue-400 md:text-9xl'>401</h1>

        <h2 className='mb-12 text-2xl font-semibold text-gray-800 md:text-3xl'>
          Unauthorized Access
        </h2>

        <div className='relative mb-8'>
          <div className='relative inline-block'>
            <div className='flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg'>
              <Shield className='h-16 w-16 fill-current text-white' />
            </div>

            <div className='absolute -top-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-100 bg-white shadow-lg'>
              <AlertCircle className='h-6 w-6 fill-current text-blue-600' />
            </div>
          </div>

          <div className='absolute -bottom-4 left-1/2 h-4 w-24 -translate-x-1/2 transform rounded-full bg-gray-300 opacity-30 blur-sm'></div>
        </div>

        <p className='mx-auto mb-8 max-w-sm text-gray-600'>
          You don't have permission to access this page. Please contact your administrator if you
          believe this is an error.
        </p>

        <div className='space-y-3 sm:flex sm:justify-center sm:space-y-0 sm:space-x-4'>
          <button
            className='w-full cursor-pointer rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto'
            onClick={handleGoBack}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
