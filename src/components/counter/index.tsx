import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/store';

interface CounterProps {
  initialValue?: number;
}

export function Counter({ initialValue = 0 }: CounterProps) {
  const [count, setCount] = useState(initialValue);
  const { increment: incrementGlobal } = useAppStore();
  const { t } = useTranslation();

  const increment = () => {
    setCount(prev => prev + 1);
  };

  const decrement = () => {
    setCount(prev => prev - 1);
  };

  const reset = () => {
    setCount(initialValue);
  };

  const incrementBoth = () => {
    setCount(prev => prev + 1);
    incrementGlobal();
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <span className='text-lg font-medium'>
          {t(`localCount`)}: {count}
        </span>
      </div>

      <div className='flex flex-wrap gap-2'>
        <Button variant='outline' onClick={decrement}>
          {/* Decrement */}
          {t('decrement')}
        </Button>
        <Button variant='default' onClick={increment}>
          {/* Increment */}
          {t('increment')}
        </Button>
        <Button variant='secondary' onClick={reset}>
          {t('reset')}
        </Button>
        <Button variant='destructive' onClick={incrementBoth}>
          {t('incrementBoth')}
        </Button>
      </div>
    </div>
  );
}
