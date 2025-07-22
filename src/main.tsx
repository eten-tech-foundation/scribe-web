import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import './i18n';

import { Toaster } from '@/components/ui/sonner';
import UnAuthorizedPage from '@/components/UnAuthorized';
import { useAuth } from '@/hooks/useAuth';

import { Auth0ProviderWrapper } from './components/auth/Auth0Provider';
import './index.css';
import { router } from './routes';
import { UnAuthenticatedRoutes } from './utils/constants';

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated && !UnAuthenticatedRoutes.includes(window.location.pathname))
    return <UnAuthorizedPage />;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <React.StrictMode>
      <Auth0ProviderWrapper>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </Auth0ProviderWrapper>
      <Toaster />
    </React.StrictMode>
  );
}
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
