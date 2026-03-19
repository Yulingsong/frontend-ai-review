import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'dist-cjs'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'dist-cjs/',
        '**/*.test.ts',
        '**/*.config.ts',
        '**/coverage/**'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    // Disable inspector
    inspector: {
      port: -1
    }
  }
});
