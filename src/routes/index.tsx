import { Router } from '@tanstack/react-router';

import {
  appInsightsTestRoute,
  callbackRoute,
  usersRoute,
  dashboardRoute,
  indexRoute,
  rootRoute,
} from './route-definitions';

const routeTree = rootRoute.addChildren([
  indexRoute,
  appInsightsTestRoute,
  callbackRoute,
  dashboardRoute,
  usersRoute,
]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
