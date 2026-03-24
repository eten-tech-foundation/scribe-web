import { useCallback } from 'react';

import { useAuth0 } from '@auth0/auth0-react';

import { Logger } from '@/lib/services/logger';

export function useAuth() {
  const auth0 = useAuth0();

  const login = useCallback(
    async (returnTo?: string) => {
      try {
        await auth0.loginWithRedirect({
          appState: { returnTo: returnTo ?? window.location.pathname },
        });
      } catch (error) {
        Logger.logException(error, {
          context: 'Login error',
          returnTo: returnTo ?? window.location.pathname,
        });
        throw error;
      }
    },
    [auth0]
  );

  const signUp = useCallback(
    async (returnTo?: string) => {
      try {
        await auth0.loginWithRedirect({
          appState: { returnTo: returnTo ?? window.location.pathname },
          authorizationParams: {
            screen_hint: 'signup',
          },
        });
      } catch (error) {
        Logger.logException(error, {
          context: 'Sign up error',
          returnTo: returnTo ?? window.location.pathname,
        });
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
      Logger.logException(error, {
        context: 'Logout error',
      });
      throw error;
    }
  }, [auth0]);

  const getAccessToken = useCallback(async () => {
    try {
      return await auth0.getAccessTokenSilently();
    } catch (error) {
      Logger.logException(error, {
        context: 'Get access token error',
      });
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
