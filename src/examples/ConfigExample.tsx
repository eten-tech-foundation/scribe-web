import React from 'react';

import { config } from '@/lib/config';

export const ConfigExample: React.FC = () => {
  return (
    <div className='rounded-md border bg-gray-50 p-4'>
      <h2 className='mb-4 text-lg font-bold'>Environment Configuration</h2>
      <div className='space-y-2'>
        <div>
          <span className='font-semibold'>API URL:</span> {config.api.url}
        </div>
        <div>
          <span className='font-semibold'>Environment:</span> {config.environment.current}
        </div>
        <div>
          <span className='font-semibold'>Is Development:</span>{' '}
          {config.environment.isDevelopment ? 'Yes' : 'No'}
        </div>
        <div>
          <span className='font-semibold'>Is Production:</span>{' '}
          {config.environment.isProduction ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  );
};

export default ConfigExample;
