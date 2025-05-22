import { useTranslation } from 'react-i18next';

import { Counter } from '@/components/counter';
import { Navigation } from '@/components/navigation';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/store';

export function AboutPage() {
  const { count } = useAppStore();
  const { t } = useTranslation();

  return (
    <div className='space-y-8'>
      <Navigation />

      <div className='space-y-6'>
        <h1 className='text-3xl font-bold'>{t(`aboutPage`)}</h1>
        <p className='text-muted-foreground text-lg'>{t(`aboutPageDescription`)}.</p>

        <Card className='p-6'>
          <h2 className='mb-4 text-xl font-semibold'>{t(`sharedComponentExample`)}</h2>
          <p className='mb-4'>
            {t(`globalCount`)}: {count}
          </p>
          <Counter initialValue={10} />
        </Card>
      </div>
    </div>
  );
}
