import { Link, Router, createRootRoute, createRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { App } from '@/app';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AboutPage } from '@/layouts/about';
import { HomePage } from '@/layouts/home';
import { TailwindTestPage } from '@/layouts/tailwind-test';

const rootRoute = createRootRoute({
  component: App,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

const tailwindTestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tailwind-test',
  component: TailwindTestPage,
});

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute, tailwindTestRoute]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const Navigation = () => {
  const { t } = useTranslation();

  return (
    <div className='flex gap-6'>
      <Link
        activeProps={{ className: 'text-foreground font-bold hover:text-primary' }}
        className='text-foreground hover:text-primary flex items-center font-medium'
        to='/'
      >
        {t(`home`)}
      </Link>
      <Link
        activeProps={{ className: 'text-foreground font-bold hover:text-primary' }}
        className='text-foreground hover:text-primary flex items-center font-medium'
        to='/about'
      >
        {t(`about`)}
      </Link>
      <Link
        activeProps={{ className: 'text-foreground font-bold hover:text-primary' }}
        className='text-foreground hover:text-primary flex items-center font-medium'
        to='/tailwind-test'
      >
        {t(`tailwind`)}
      </Link>
      <div className='flex items-center gap-2'>
        <ThemeToggle />
      </div>
    </div>
  );
};
