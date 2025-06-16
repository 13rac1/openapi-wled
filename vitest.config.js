import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    setupFiles: ['./tests/vitest.setup.js'],
    sequence: {
      concurrent: false,
      shuffle: false,
      hooks: 'list',
    },
  },
}) 