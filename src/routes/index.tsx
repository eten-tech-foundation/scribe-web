import { Router } from '@tanstack/react-router';

import {
  aboutRoute,
  appInsightsTestRoute,
  indexRoute,
  rootRoute,
  tailwindTestRoute,
} from './route-definitions';

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  tailwindTestRoute,
  appInsightsTestRoute,
]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
