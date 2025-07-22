import { useCallback } from 'react';

import { useAuth0 } from '@auth0/auth0-react';

import logger from '@/lib/error-logger';

export function useAuth() {
  const auth0 = useAuth0();

  const login = useCallback(
    async (returnTo?: string) => {
      try {
        await auth0.loginWithRedirect({
          appState: { returnTo: returnTo || window.location.pathname },
        });
      } catch (error) {
        logger.error(error as Error, 'useAuth', 'login');
        throw error;
      }
    },
    [auth0]
  );

  const signUp = useCallback(
    async (returnTo?: string) => {
      try {
        await auth0.loginWithRedirect({
          appState: { returnTo: returnTo || window.location.pathname },
          authorizationParams: {
            screen_hint: 'signup',
          },
        });
      } catch (error) {
        logger.error(error as Error, 'useAuth', 'signUp');
        throw error;
      }
    },
    [auth0]
  );

  const logout = useCallback(async () => {
    try {
      await auth0.logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
    } catch (error) {
      logger.error(error as Error, 'useAuth', 'logout');
      throw error;
    }
  }, [auth0]);

  const getAccessToken = useCallback(async () => {
    try {
      return await auth0.getAccessTokenSilently();
    } catch (error) {
      logger.error(error as Error, 'useAuth', 'getAccessToken');
      throw error;
    }
  }, [auth0]);

  return {
    ...auth0,
    login,
    signUp,
    logout,
    getAccessToken,
  };
}
