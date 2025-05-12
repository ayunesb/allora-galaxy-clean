
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-fast-compare': 'react-fast-compare/index.js', // 👈 Add this alias
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
      onwarn(warning, warn) {
        if (warning.message && (
          warning.message.includes('three-bmfont-text') || 
          warning.message.includes('git+') ||
          warning.message.includes('git clone') ||
          warning.message.includes('document-register-element') ||
          warning.message.includes('debug')
        )) return;
        warn(warning);
      }
    }
  },
  server: {
    port: 8080,
    host: "::",
    historyApiFallback: true, // For React Router SPA fallback
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '9c3148d9-ab17-4b9a-908f-dd75ce70b6c1.lovableproject.com',
      '.lovableproject.com'
    ]
  },
  optimizeDeps: {
    exclude: [
      'three-bmfont-text', 
      'document-register-element', 
      'debug'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
    include: ['react-helmet-async', '@tanstack/react-query'], // 👈 Add this line
  }
});

// Vitest configuration
export const test = {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
};
