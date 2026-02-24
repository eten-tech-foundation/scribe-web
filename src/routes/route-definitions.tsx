import { createRootRoute, createRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { App } from '@/app';
import { RoleBasedHomePage } from '@/components/RoleBasedHomePage';
import { AppInsightsTestPage } from '@/layouts/app-insights-test';
import DraftingPage from '@/layouts/bible/DraftingPage';
import { translationLoader } from '@/layouts/bible/TranslationLoader';
import { PrivacyPolicyPage } from '@/layouts/legal/PrivacyPolicyPage';
import { TermsOfUsePage } from '@/layouts/legal/TermsOfUsePage';
import { ProjectsWrapper } from '@/layouts/projects/index';
import { ProjectDetailWrapper } from '@/layouts/projects/ProjectDetailWrapper';
import { TailwindTestPage } from '@/layouts/tailwind-test';
import { UsersWrapper } from '@/layouts/users/UsersWrapper';

export const modalSchema = z.enum(['settings', 'profile', 'add', 'edit', 'create', 'export']);
export type ModalType = z.infer<typeof modalSchema>;

export const rootRoute = createRootRoute({
  component: App,
  validateSearch: z.object({
    modal: modalSchema.optional(),
  }).parse,
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

export const userSearchSchema = z.object({
  modal: modalSchema.optional(),
  userId: z.number().optional(),
});
export type UserSearch = z.infer<typeof userSearchSchema>;

export const userListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  validateSearch: userSearchSchema.parse,
  component: UsersWrapper,
});

export const projectSearchSchema = z.object({
  modal: modalSchema.optional(),
});
export type ProjectSearch = z.infer<typeof projectSearchSchema>;

export const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  validateSearch: projectSearchSchema.parse,
  component: ProjectsWrapper,
});

export const projectDetailSearchSchema = z.object({
  modal: modalSchema.optional(),
});
export type ProjectDetailSearch = z.infer<typeof projectDetailSearchSchema>;

export const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId',
  validateSearch: projectDetailSearchSchema.parse,
  component: ProjectDetailWrapper,
});

export const translationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/translation/$bookId/$chapterNumber',
  validateSearch: z.object({
    t: z.string().optional(),
  }).parse,
  loader: translationLoader,
  component: DraftingPage,
  gcTime: 0,
  staleTime: 0,
});

export const viewResourceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/view/$bookId/$chapterNumber',
  validateSearch: z.object({
    t: z.string().optional(),
  }).parse,
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
