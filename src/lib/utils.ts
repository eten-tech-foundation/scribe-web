import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string, handling Tailwind class conflicts
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Returns true if the current environment is development
 */
export const isDev = process.env.NODE_ENV === 'development';

/**
 * Returns true if the current environment is production
 */
export const isProd = process.env.NODE_ENV === 'production';

/**
 * Returns true if the current code is running on the client (browser)
 */
export const isClient = typeof window !== 'undefined';

/**
 * Returns true if the current code is running on the server
 */
export const isServer = !isClient;
