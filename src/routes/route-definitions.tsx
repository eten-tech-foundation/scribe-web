import { createRootRoute, createRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { App } from '@/app';
import { RoleBasedHomePage } from '@/components/RoleBasedHomePage';
import { AppInsightsTestPage } from '@/layouts/app-insights-test';
import DraftingPage from '@/layouts/bible/DraftingPage';
import { translationLoader } from '@/layouts/bible/TranslationLoader';
import { PrivacyPolicyPage } from '@/layouts/legal/PrivacyPolicyPage';
import { TermsOfUsePage } from '@/layouts/legal/TermsOfUsePage';
import { CreateProjectPage } from '@/layouts/projects/CreateProjectPage';
import { ExportProjectWrapper } from '@/layouts/projects/ExportProjectWrapper';
import { ProjectsWrapper } from '@/layouts/projects/index';
import { ProjectDetailWrapper } from '@/layouts/projects/ProjectDetailWrapper';
import { TailwindTestPage } from '@/layouts/tailwind-test';
import { UsersWrapper } from '@/layouts/users/UsersWrapper';

export const globalModalSchema = z.enum(['settings', 'profile']);
export type GlobalModal = z.infer<typeof globalModalSchema>;

export const rootRoute = createRootRoute({
  component: App,
  validateSearch: z.object({}).parse,
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

export const userModalSchema = z.enum(['add', 'edit']);
export type UserModal = z.infer<typeof userModalSchema>;

export const userSearchSchema = z.object({
  modal: z.union([globalModalSchema, userModalSchema]).optional(),
  userId: z.number().optional(),
});
export type UserSearch = z.infer<typeof userSearchSchema>;

export const userListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  validateSearch: userSearchSchema.parse,
  component: UsersWrapper,
});

export const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsWrapper,
});

export const createProjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/create',
  component: CreateProjectPage,
});

export const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId',
  component: ProjectDetailWrapper,
});

export const exportProjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId/export',
  component: ExportProjectWrapper,
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
