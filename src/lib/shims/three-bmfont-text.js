
// This is a simple shim for the three-bmfont-text package to avoid git clone errors
// Since we're encountering installation issues with the library, we'll create a minimal shim
// This file will be imported instead of the actual package

// Export a minimalist API that mimics the three-bmfont-text package
exports.createText = function createText() {
  console.warn('Using three-bmfont-text shim implementation');
  return {
    position: { array: [] },
    uv: { array: [] },
    index: { array: [] },
    update: function() {},
    dispose: function() {}
  };
};

// Add any other functions that might be needed
