
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      provider: 'v8',
    },
    exclude: ['node_modules', 'dist', 'build', '.git'],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    deps: {
      optimizer: {
        web: {
          exclude: ['@supabase/supabase-js'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'src': path.resolve(__dirname, 'src'),
    },
  },
});
