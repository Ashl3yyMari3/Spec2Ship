/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
  },
  resolve: {
    alias: {
      '@backend': resolve(__dirname, 'src/backend'),
      '@frontend': resolve(__dirname, 'src/frontend'),
    },
  },
});
