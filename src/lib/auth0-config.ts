export const auth0Config = {
  domain: (import.meta.env.VITE_AUTH0_DOMAIN as string | undefined) ?? '',
  clientId: (import.meta.env.VITE_AUTH0_CLIENT_ID as string | undefined) ?? '',
  authorizationParams: {
    redirect_uri: `${window.location.origin}/callback`,
    audience: (import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined) ?? '',
  },
  cacheLocation: 'localstorage' as const,
  useRefreshTokens: true,
} as const;
