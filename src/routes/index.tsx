import { Router } from '@tanstack/react-router';

import { type ProjectItem, type User } from '@/lib/types';

import {
  appInsightsTestRoute,
  indexRoute,
  privacyPolicyRoute,
  projectDetailRoute,
  projectsRoute,
  rootRoute,
  tailwindTestRoute,
  termsOfUseRoute,
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
  projectDetailRoute,
  translationRoute,
  viewResourceRoute,
  privacyPolicyRoute,
  termsOfUseRoute,
]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
  interface HistoryState {
    projectItem?: ProjectItem;
    user?: User;
  }
}
