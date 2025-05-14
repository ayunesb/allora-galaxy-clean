
declare namespace PlaywrightTest {
  interface Page {
    goto: (url: string) => Promise<any>;
    fill: (selector: string, value: string) => Promise<void>;
    click: (selector: string) => Promise<void>;
    waitForURL: (url: string) => Promise<void>;
    waitForSelector: (selector: string, options?: any) => Promise<void>;
    textContent: (selector: string) => Promise<string | null>;
  }
  
  interface Test {
    describe: (name: string, fn: () => void) => void;
    beforeEach: (fn: (args: { page: Page }) => Promise<void>) => void;
    only: (name: string, fn: (args: { page: Page }) => Promise<void>) => void;
    skip: (name: string, fn: (args: { page: Page }) => Promise<void>) => void;
    (name: string, fn: (args: { page: Page }) => Promise<void>): void;
  }
  
  interface Expect {
    (value: any): {
      toContain: (expected: string) => void;
      toBe: (expected: any) => void;
      toEqual: (expected: any) => void;
    };
  }
}

declare module '@playwright/test' {
  export const test: PlaywrightTest.Test;
  export const expect: PlaywrightTest.Expect;
}
