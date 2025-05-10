
// This is a simplified shim for three-bmfont-text to avoid git clone errors
// It provides the minimal functionality required by the application

export default function createTextGeometry(options) {
  // Return a simplified version of the geometry
  return {
    update: () => {},
    dispose: () => {},
    layout: {
      width: 0,
      height: 0,
      descender: 0,
      baseline: 0,
      lineHeight: 0,
      capHeight: 0,
      xHeight: 0,
      glyphs: []
    },
    visibleGlyphs: [],
    vertices: new Float32Array(),
    attributesNeedUpdate: () => true,
  };
}

export const utils = {
  getAlignedX: (textWidth, align, width) => {
    if (align === 'center') return (width - textWidth) / 2;
    if (align === 'right') return width - textWidth;
    return 0;
  }
};
