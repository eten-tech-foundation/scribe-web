import { type FC } from 'react';

import ConfigExample from './ConfigExample';

const ConfigTest: FC = () => {
  return (
    <div className='p-6'>
      <h1 className='mb-4 text-2xl font-bold'>Configuration Test</h1>
      <ConfigExample />
    </div>
  );
};

export default ConfigTest;
