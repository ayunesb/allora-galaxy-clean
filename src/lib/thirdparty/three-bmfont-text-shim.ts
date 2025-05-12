
/**
 * This file provides a shim for the three-bmfont-text module which was causing 
 * build issues. We're implementing our own version of the functionality that is 
 * compatible with our build system.
 * 
 * In a production environment, you would want to properly integrate the actual
 * library or find a maintained alternative.
 */

// Minimal interface required by ForceGraph2D
interface BMFontText {
  createTextGeometry: (text: string, options?: any) => any;
}

// Simple implementation that can be further extended if needed
const createTextGeometry = (text: string, options?: any) => {
  return {
    text,
    options,
    visibleGlyphs: text.split('').map((char, i) => ({
      position: [i * 10, 0, 0],
      data: { char }
    })),
    layout: {
      width: text.length * 10,
      height: 10
    }
  };
};

// Export the minimal interface needed
export const threeBMFontText: BMFontText = {
  createTextGeometry
};

export default createTextGeometry;
