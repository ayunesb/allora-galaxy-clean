
// This is a shim for the three-bmfont-text package
// It provides bare minimum functionality to prevent build errors
// while the actual package is unavailable

module.exports = function createTextGeometry(opt) {
  return {
    update: function() {},
    layout: null,
    visibleGlyphs: [],
    opacity: 1,
    color: 0xffffff,
    position: [0, 0, 0],
    scale: [1, 1, 1],
    visible: true
  };
};
