
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Automatically reset the DOM after each test
afterEach(() => {
  cleanup();
});

// Mock the matchMedia function which is not available in JSDOM
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
};

// Mock IntersectionObserver which is not available in JSDOM
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.IntersectionObserver = MockIntersectionObserver as any;
