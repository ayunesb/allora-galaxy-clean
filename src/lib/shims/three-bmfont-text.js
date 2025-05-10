
// This is a simple shim for the three-bmfont-text package to avoid git clone errors
// Since we're encountering installation issues with the library, we'll create a minimal shim
module.exports = {
  createText: function() {
    console.warn('three-bmfont-text is using a shim implementation');
    return {
      position: { array: [] },
      uv: { array: [] },
      index: { array: [] },
      update: function() {},
      dispose: function() {}
    };
  }
};
