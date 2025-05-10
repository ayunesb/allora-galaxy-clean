
// This is a comprehensive shim for the three-bmfont-text package
// It provides the necessary interfaces to prevent build errors
// while the actual package is unavailable

function createGeometry(opt) {
  return {
    update: function() {},
    vertices: [],
    visibleGlyphs: [],
    layout: null,
    positions: [],
    cells: [],
    uvs: [],
    dispose: function() {},
  };
}

function createMeshes(opt) {
  return [];
}

function createBasicText(opt) {
  return {
    text: opt.text || '',
    font: opt.font || null,
    width: opt.width || 0,
    align: opt.align || 'left',
    letterSpacing: opt.letterSpacing || 0,
    mode: opt.mode || 'normal',
    opacity: opt.opacity || 1,
    color: opt.color || 0xffffff,
    billboard: opt.billboard || false,
    visible: opt.visible !== false
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

module.exports = createTextGeometry;
