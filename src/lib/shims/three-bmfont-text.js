
// This is an improved shim for the three-bmfont-text package
// We're implementing just enough to prevent build errors

/**
 * Creates a text geometry that mimics the three-bmfont-text behavior
 */
function createTextGeometry(text, opts = {}) {
  // Return a basic implementation that won't break the app
  return {
    text,
    options: opts,
    update: function() {},
    dispose: function() {},
    vertices: [],
    visibleGlyphs: [],
    layout: {
      width: opts.width || 0,
      height: opts.height || 0,
      lineHeight: opts.lineHeight || 0
    }
  };
}

// Export the main function as both default export and named export
export default createTextGeometry;
export { createTextGeometry };

// Add any additional exports that might be needed
export const utils = {
  // Font utilities
  getAlignedOffset: () => [0, 0],
  createLayout: (options) => ({
    text: options.text || '',
    width: options.width || 0,
    height: options.height || 0,
    lines: [],
    glyphs: [],
    characters: []
  }),
  computeGlyphBounds: () => ({ min: [0, 0], max: [0, 0] }),
  measureWidth: () => 0,
  getGlyphMetrics: () => ({ width: 0, height: 0, xadvance: 0 }),

  // Alignment utility functions
  alignText: (text, width, align) => 0,
  wordWrap: (text, options) => [],
  computeLineMetrics: () => ({ width: 0, height: 0, ascender: 0, descender: 0 })
};

// Additional WebGL related helper functions
export const shaderLib = {
  msdf: {
    vertex: `void main() {}`,
    fragment: `void main() {}`
  }
};
