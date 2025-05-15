
/**
 * Test setup file for Vitest
 * This file is automatically loaded before running tests
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock match media
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {}
  };
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(private callback: IntersectionObserverCallback) {}
  
  disconnect() { return null; }
  observe() { return null; }
  takeRecords() { return []; }
  unobserve() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(private callback: ResizeObserverCallback) {}
  
  disconnect() { return null; }
  observe() { return null; }
  unobserve() { return null; }
};

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true
});

// Suppress React 18 console errors about act()
const originalError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError(...args);
};
