
// This is a minimal shim for the three-bmfont-text package
// It provides the basic functionality needed for react-force-graph to work
// without requiring the actual three-bmfont-text package that's having git clone issues

const createTextGeometry = (text, opts) => {
  // Return a minimal implementation that won't break the app
  return {
    text,
    options: opts,
    update: () => {},
    dispose: () => {}
  };
};

export default createTextGeometry;
