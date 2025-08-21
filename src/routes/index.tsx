import { Router } from '@tanstack/react-router';

import {
  appInsightsTestRoute,
  indexRoute,
  projectsRoute,
  rootRoute,
  tailwindTestRoute,
  userListRoute,
} from './route-definitions';

const routeTree = rootRoute.addChildren([
  indexRoute,
  tailwindTestRoute,
  appInsightsTestRoute,
  userListRoute,
  projectsRoute,
]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
