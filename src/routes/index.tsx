import { Router } from '@tanstack/react-router';

import {
  appInsightsTestRoute,
  callbackRoute,
  usersRoute,
  indexRoute,
  rootRoute,
} from './route-definitions';

const routeTree = rootRoute.addChildren([
  indexRoute,
  appInsightsTestRoute,
  callbackRoute,
  usersRoute,
]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
