import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// If you are running with Node, make sure 'vite', '@vitejs/plugin-react', and 'path' are installed.
// For 'path', you may need "allowSyntheticDefaultImports": true in tsconfig.

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});