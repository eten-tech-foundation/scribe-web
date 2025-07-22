import { createRootRoute, createRoute } from '@tanstack/react-router';

import { App } from '@/app';
import { AppInsightsTestPage } from '@/layouts/app-insights-test';
import { CallbackPage } from '@/layouts/callback';
import { HomePage } from '@/layouts/home';
import { UsersPage } from '@/layouts/users';

export const rootRoute = createRootRoute({
  component: App,
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
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

export const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: UsersPage,
});
