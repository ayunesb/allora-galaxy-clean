
/**
 * This is a minimal shim for three-bmfont-text to prevent import errors.
 * It provides just enough functionality to avoid breaking builds.
 */

// Basic constructor that takes options
function createText(options = {}) {
  return {
    text: options.text || '',
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

// Export as both CommonJS and ES module
if (typeof module !== 'undefined') {
  module.exports = createText;
  module.exports.default = createText;
}

export default createText;
