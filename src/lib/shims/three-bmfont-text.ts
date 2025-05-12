
/**
 * This is a TypeScript shim for three-bmfont-text to prevent import errors.
 * It provides just enough functionality to avoid breaking builds while using
 * the npm package when available.
 */

// Basic constructor that takes options
function createTextGeometry(text: string, options: any = {}) {
  // If the actual package is available, use it
  try {
    // Try to use the actual npm package directly
    const actualImport = require('three-bmfont-text');
    return typeof actualImport === 'function' ? actualImport(text, options) : null;
  } catch (e) {
    // Fallback to our shim implementation
    console.warn('Using three-bmfont-text shim');
  }

  // Shim implementation
  return {
    text,
    position: { x: 0, y: 0, z: 0 },
    layout: options.layout || {},
    material: options.material || null,
    geometry: {
      update: () => {},
      attributes: {},
      dispose: () => {}
    },
    update: () => {},
    dispose: () => {}
  };
}

// Export as a module with named exports
export default createTextGeometry;

export const threeBMFontText = {
  createTextGeometry
};
