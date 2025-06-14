module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/__tests__/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: true,
  testTimeout: 10000,
  setupFiles: ['<rootDir>/tests/jest.setup.js']
}; 