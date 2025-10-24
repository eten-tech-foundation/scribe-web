import { Router } from '@tanstack/react-router';

import { type ProjectItem } from '@/lib/types';

import {
  appInsightsTestRoute,
  indexRoute,
  projectsRoute,
  rootRoute,
  tailwindTestRoute,
  translationRoute,
  userListRoute,
  viewResourceRoute,
} from './route-definitions';

const routeTree = rootRoute.addChildren([
  indexRoute,
  tailwindTestRoute,
  appInsightsTestRoute,
  userListRoute,
  projectsRoute,
  translationRoute,
  viewResourceRoute,
]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
  interface HistoryState {
    projectItem?: ProjectItem;
  }
}
