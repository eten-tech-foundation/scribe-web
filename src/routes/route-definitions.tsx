import { createRootRoute, createRoute } from '@tanstack/react-router';

import { App } from '@/app';
import { AboutPage } from '@/layouts/about';
import { HomePage } from '@/layouts/home';
import { TailwindTestPage } from '@/layouts/tailwind-test';

// Root route definition
export const rootRoute = createRootRoute({
  component: App,
});

// Child route definitions
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

export const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

export const tailwindTestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tailwind-test',
  component: TailwindTestPage,
});
