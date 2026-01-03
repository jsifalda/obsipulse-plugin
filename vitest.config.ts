import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['node_modules', 'main.js', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'lib/**/*.ts'],
      exclude: [
        'src/main.ts',
        'src/styles.css',
        'src/assets/**',
        'src/components/**/*.tsx',
        '**/*.d.ts',
      ],
      reportsDirectory: './coverage',
    },
    mockReset: true,
    restoreMocks: true,
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      obsidian: resolve(__dirname, 'tests/__mocks__/obsidian.ts'),
      'obsidian-dataview': resolve(__dirname, 'tests/__mocks__/obsidian-dataview.ts'),
    },
  },
})
