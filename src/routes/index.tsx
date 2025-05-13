import { Router, Link, createRootRoute, createRoute } from '@tanstack/react-router';

import { App } from '@/app';
import { AboutPage } from '@/layouts/about';
import { HomePage } from '@/layouts/home';

// Create a root route
const rootRoute = createRootRoute({
  component: App,
});

// Create an index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

// Create an about route
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

// Create the route tree using the routes
const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);

// Create the router using the route tree
export const router = new Router({ routeTree });

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Navigation component
export const Navigation = () => {
  return (
    <div className='flex gap-4'>
      <Link
        activeProps={{ className: 'font-bold text-blue-700' }}
        className='font-medium text-blue-500 hover:text-blue-700'
        to='/'
      >
        Home
      </Link>
      <Link
        activeProps={{ className: 'font-bold text-blue-700' }}
        className='font-medium text-blue-500 hover:text-blue-700'
        to='/about'
      >
        About
      </Link>
    </div>
  );
};
