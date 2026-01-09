import { createRootRoute, createRoute } from '@tanstack/react-router';

import { App } from '@/app';
import { RoleBasedHomePage } from '@/components/RoleBasedHomePage';
import { AppInsightsTestPage } from '@/layouts/app-insights-test';
import DraftingPage from '@/layouts/bible/DraftingPage';
import { translationLoader } from '@/layouts/bible/TranslationLoader';
import { PrivacyPolicyPage } from '@/layouts/legal/PrivacyPolicyPage';
import { TermsOfUsePage } from '@/layouts/legal/TermsOfUsePage';
import { ProjectsWrapper } from '@/layouts/projects';
import { TailwindTestPage } from '@/layouts/tailwind-test';
import { UsersWrapper } from '@/layouts/users/UsersWrapper';

export const rootRoute = createRootRoute({
  component: App,
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: RoleBasedHomePage,
});

export const tailwindTestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tailwind-test',
  component: TailwindTestPage,
});

export const appInsightsTestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app-insights-test',
  component: AppInsightsTestPage,
});

export const userListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user-list',
  component: UsersWrapper,
});

export const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsWrapper,
});

export const translationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/translation/$bookId/$chapterNumber',
  validateSearch: (search: Record<string, unknown>) => {
    return {
      t: (search.t as string) || undefined,
    };
  },
  loader: translationLoader,
  component: DraftingPage,
  gcTime: 0,
  staleTime: 0,
});

export const viewResourceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/view/$bookId/$chapterNumber',
  validateSearch: (search: Record<string, unknown>) => {
    return {
      t: (search.t as string) || undefined,
    };
  },
  loader: translationLoader,
  component: DraftingPage,
  gcTime: 0,
  staleTime: 0,
});

export const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/legal/privacy',
  component: PrivacyPolicyPage,
});

export const termsOfUseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/legal/terms',
  component: TermsOfUsePage,
});
