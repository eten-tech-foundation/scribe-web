import { Router } from '@tanstack/react-router';

import { aboutRoute, indexRoute, rootRoute, tailwindTestRoute } from './route-definitions';

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute, tailwindTestRoute]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
