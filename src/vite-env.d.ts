
/// <reference types="vite/client" />

// Add this to make the three-bmfont-text shim importable
declare module 'three-bmfont-text' {
  const createTextGeometry: (text: string, options?: any) => any;
  export default createTextGeometry;
}
