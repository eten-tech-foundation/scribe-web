import { Router } from '@tanstack/react-router';

import { type ProjectItem, type User } from '@/lib/types';

import {
  addUserRoute,
  appInsightsTestRoute,
  editUserRoute,
  indexRoute,
  privacyPolicyRoute,
  profileRoute,
  projectDetailRoute,
  projectsRoute,
  rootRoute,
  settingsRoute,
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
  profileRoute,
  settingsRoute,
  addUserRoute,
  editUserRoute,
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
