
import React from 'react';

/**
 * Creates a lazily-loaded component with named exports
 * 
 * @example
 * // Instead of:
 * // import { UserProfile } from './UserProfile';
 * // Use:
 * const { UserProfile } = lazyImport(() => import('./UserProfile'), 'UserProfile');
 * 
 * @param factory Dynamic import function
 * @param name Component name to extract from the module
 * @returns Object containing the lazily-loaded component
 */
export function lazyImport<
  T extends React.ComponentType<any>,
  I extends { [K2 in K]: T },
  K extends keyof I
>(factory: () => Promise<I>, name: K): { [K2 in K]: React.LazyExoticComponent<T> } {
  return Object.defineProperty(
    {},
    name,
    {
      configurable: true,
      enumerable: true,
      get: () => React.lazy(() => factory().then((module) => ({ default: module[name] }))),
    },
  ) as { [K2 in K]: React.LazyExoticComponent<T> };
}

/**
 * Creates a lazily-loaded page with code splitting
 * 
 * @example
 * // Use:
 * const DashboardPage = lazyPage(() => import('./pages/DashboardPage'));
 * 
 * @param factory Dynamic import function returning a page component module
 * @returns Lazily-loaded page component
 */
export function lazyPage<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(factory);
}
