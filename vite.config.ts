
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Use our shim for the problematic package
      'three-bmfont-text': path.resolve(__dirname, 'src/lib/shims/three-bmfont-text.js'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      external: [
        'react-force-graph-2d',
        'react-helmet-async',
        'https://deno.land/std@0.168.0/http/server.ts',
        'https://esm.sh/@supabase/supabase-js@2',
        'https://esm.sh/stripe@12.0.0?target=deno'
      ]
    }
  },
  server: {
    port: 8080,
    host: "::"
  },
  optimizeDeps: {
    exclude: ['three-bmfont-text'] // Exclude the problematic package from optimization
  }
}));

// Vitest configuration
export const test = {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
};
