import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200, // avoid warnings on large chunks
  },
});

// Vitest configuration
export const test = {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/setupTests.ts', // Optional: Add setup file if needed
};
