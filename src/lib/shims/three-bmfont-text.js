
/**
 * This is a shim for the three-bmfont-text package
 * It's a minimal implementation to avoid git clone issues
 */

// Basic placeholder implementation
export default function createTextGeometry(options = {}) {
  console.warn('Using three-bmfont-text shim - limited functionality');
  return {
    dispose: () => {},
    layout: options.text || '',
    update: () => {}
  };
}
