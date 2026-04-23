import { createFileRoute } from '@tanstack/react-router';

import { AuthenticatedLayout } from '@/features/auth/AuthenticatedLayout';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isLoading && !context.auth.isAuthenticated) {
      void context.auth.loginWithRedirect({
        appState: {
          returnTo: window.location.pathname + window.location.search,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});
