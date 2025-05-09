
// This is a shim for the three-bmfont-text package that's having git clone issues
// We're implementing just enough to prevent build errors

// Mock the core functionality that the package provides
function createTextGeometry(text, opts = {}) {
  // Return a basic implementation that won't break the app
  return {
    text,
    options: opts,
    update: function() {},
    dispose: function() {}
  };
}

// Export the main function as both default export and named export
export default createTextGeometry;
export { createTextGeometry };

// Add any additional exports that might be needed
export const utils = {
  getAlignedOffset: () => [0, 0],
  createLayout: (options) => ({
    text: options.text || '',
    width: options.width || 0,
    height: options.height || 0,
    lines: []
  })
};
