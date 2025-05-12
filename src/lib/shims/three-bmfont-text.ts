/**
 * This is a TypeScript shim for three-bmfont-text to prevent import errors.
 * It provides enough functionality to avoid breaking builds while using
 * the npm package when available.
 */

// Define basic interface for text geometry
interface TextGeometry {
  text: string;
  position: { x: number; y: number; z: number };
  layout: any;
  material?: any;
  update: () => void;
  geometry?: {
    update: () => void;
    attributes: Record<string, any>;
    dispose: () => void;
  };
  dispose: () => void;
}

// Basic constructor that takes options
function createTextGeometry(text: string, options: any = {}): TextGeometry {
  // If the actual package is available, try to use it
  try {
    // First attempt: Try to use the actual npm package directly
    const actualModule = require('three-bmfont-text');
    if (typeof actualModule === 'function') {
      return actualModule(text, options);
    }
  } catch (e) {
    console.warn('Using three-bmfont-text shim - real module not available');
  }
  
  // If that fails, use our shim implementation
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

// Export as a module with default and named exports
export default {} as any;

export const threeBMFontText = {
  createTextGeometry
};

// Also provide CommonJS export pattern for broader compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = createTextGeometry;
  module.exports.createTextGeometry = createTextGeometry;
}
