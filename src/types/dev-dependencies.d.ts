
/**
 * Type declarations for development dependencies
 * These declarations are used only in test files and not included in production builds
 */

// Playwright types
declare module '@playwright/test' {
  export const test: any;
  export const expect: any;
  export type Page = any;
  export type BrowserContext = any;
  export type Browser = any;
}
