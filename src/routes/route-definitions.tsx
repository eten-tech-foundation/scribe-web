import { createRootRoute, createRoute } from '@tanstack/react-router';

import { App } from '@/app';
import { AboutPage } from '@/layouts/about';
import { AppInsightsTestPage } from '@/layouts/app-insights-test';
import { CallbackPage } from '@/layouts/callback';
import { DashboardPage } from '@/layouts/dashboard';
import { HomePage } from '@/layouts/home';
import { TailwindTestPage } from '@/layouts/tailwind-test';
import { UsersPage } from '@/layouts/users';

export const rootRoute = createRootRoute({
  component: App,
});

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

export const appInsightsTestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app-insights-test',
  component: AppInsightsTestPage,
});

export const callbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/callback',
  component: CallbackPage,
});

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

export const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: UsersPage,
});
