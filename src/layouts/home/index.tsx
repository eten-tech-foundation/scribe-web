import { useTranslation } from 'react-i18next';

import { Counter } from '@/components/counter';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/store';

export function HomePage(): JSX.Element {
  const { count, increment } = useAppStore();
  const { t } = useTranslation();

  return (
    <div className='space-y-8'>
      <Navigation />

      <div className='space-y-6'>
        <h1 className='text-3xl font-bold'>{t(`homePage`)}</h1>
        <p className='text-muted-foreground text-lg'>{t(`welcome`)}</p>

        <Card className='p-6'>
          <h2 className='mb-4 text-xl font-semibold'>{t(`sharedCounterExample`)}</h2>
          <div className='space-y-4'>
            <p>
              {t(`globalStateCount`)}: {count}
            </p>
            <Button onClick={increment}>{t(`incrementGobalCount`)}</Button>
            <Counter initialValue={5} />
          </div>
        </Card>
      </div>
    </div>
  );
}
