import { Router } from '@tanstack/react-router';

import {
  aboutRoute,
  appInsightsTestRoute,
  callbackRoute,
  dashboardRoute,
  indexRoute,
  rootRoute,
  tailwindTestRoute,
} from './route-definitions';

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  tailwindTestRoute,
  appInsightsTestRoute,
  callbackRoute,
  dashboardRoute,
]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
