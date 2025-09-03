import { createRootRoute, createRoute } from '@tanstack/react-router';

import { App } from '@/app';
import { AppInsightsTestPage } from '@/layouts/app-insights-test';
import { HomePage } from '@/layouts/home';
import { ProjectsWrapper } from '@/layouts/projects/ProjectsWrapper';
import { TailwindTestPage } from '@/layouts/tailwind-test';
import { UsersWrapper } from '@/layouts/users/UsersWrapper';

export const rootRoute = createRootRoute({
  component: App,
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
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

export const userListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user-list',
  component: UsersWrapper,
});
export const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsWrapper,
});
