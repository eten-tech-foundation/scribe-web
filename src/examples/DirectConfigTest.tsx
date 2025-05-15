import React from 'react';

import { config } from '@/lib/config';

const DirectConfigTest: React.FC = () => {
  // Using config directly in the component
  const isDevEnvironment = config.environment.isDevelopment;
  const apiEndpoint = config.api.url;

  return (
    <div className='mb-4 rounded-md border p-4 shadow-sm'>
      <h2 className='mb-2 text-lg font-bold'>Direct Config Usage Test</h2>
      <div className='grid grid-cols-2 gap-2'>
        <div className='font-medium'>API URL:</div>
        <div>{apiEndpoint}</div>

        <div className='font-medium'>Environment:</div>
        <div>{config.environment.current}</div>

        <div className='font-medium'>Development Mode:</div>
        <div>{isDevEnvironment ? 'Enabled' : 'Disabled'}</div>
      </div>
    </div>
  );
};

export default DirectConfigTest;
