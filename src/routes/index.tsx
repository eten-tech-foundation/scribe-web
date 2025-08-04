import { Router } from '@tanstack/react-router';

import {
  aboutRoute,
  appInsightsTestRoute,
  callbackRoute,
  indexRoute,
  rootRoute,
  tailwindTestRoute,
  userInfoRoute,
} from './route-definitions';

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  tailwindTestRoute,
  appInsightsTestRoute,
  callbackRoute,
  userInfoRoute,
]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
