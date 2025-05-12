
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
      '@': path.resolve(__dirname, '.'),
      // Use our internal shim instead of the external package
      'three-bmfont-text': path.resolve(__dirname, 'lib/shims/three-bmfont-text.ts'),
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
      ],
      // Add onwarn handler to suppress git clone warnings
      onwarn(warning, warn) {
        // Suppress git clone warnings for three-bmfont-text
        if (warning.message && (
          warning.message.includes('three-bmfont-text') || 
          warning.message.includes('git+') ||
          warning.message.includes('git clone')
        )) return;
        warn(warning);
      }
    }
  },
  server: {
    port: 8080,
    host: "::"
  },
  optimizeDeps: {
    exclude: ['three-bmfont-text'], // Exclude the problematic package from optimization
    esbuildOptions: {
      // Additional configuration to prevent git clone attempts
      define: {
        global: 'globalThis',
      },
    },
  }
}));

// Vitest configuration
export const test = {
  globals: true,
  environment: 'jsdom',
  setupFiles: './test/setup.ts',
};
