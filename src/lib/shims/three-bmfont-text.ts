
/**
 * This is a TypeScript shim for three-bmfont-text to prevent import errors.
 * It provides just enough functionality to avoid breaking builds.
 */

// Basic constructor that takes options
function createTextGeometry(text: string, options: any = {}) {
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
