
/**
 * Comprehensive shim for the three-bmfont-text package
 * This prevents build errors while the actual package is unavailable
 * 
 * The shim implements all commonly used methods and properties to ensure
 * components using this package can compile without errors
 */

function createGeometry(opt) {
  return {
    update: function() {},
    vertices: [],
    visibleGlyphs: [],
    layout: {
      width: opt?.width || 0,
      height: opt?.height || 0,
      lineHeight: opt?.lineHeight || 0,
      baseline: opt?.baseline || 0,
      descender: 0,
      ascender: 0,
      xHeight: 0,
      capHeight: 0,
      lineWidths: [],
      linesTotal: 0
    },
    positions: [],
    cells: [],
    uvs: [],
    dispose: function() {},
    computeBoundingSphere: function() {},
    computeBoundingBox: function() {},
    needsUpdate: true
  };
}

function createMeshes(opt) {
  return [{
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    material: { opacity: 1, transparent: false },
    geometry: createGeometry(opt)
  }];
}

function createBasicText(opt) {
  return {
    text: opt?.text || '',
    font: opt?.font || null,
    width: opt?.width || 0,
    align: opt?.align || 'left',
    letterSpacing: opt?.letterSpacing || 0,
    mode: opt?.mode || 'normal',
    opacity: opt?.opacity || 1,
    color: opt?.color || 0xffffff,
    billboard: opt?.billboard || false,
    visible: opt?.visible !== false
  };
}

// Main export to match the expected API
function createTextGeometry(opt) {
  return createGeometry(opt);
}

// Add all expected exports
createTextGeometry.createGeometry = createGeometry;
createTextGeometry.createMeshes = createMeshes;
createTextGeometry.createBasicText = createBasicText;

// Handle both ESM and CommonJS exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = createTextGeometry;
} else {
  export default createTextGeometry;
}
