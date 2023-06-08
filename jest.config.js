// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Automatically clear mock calls and instances between every test.
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test.
  collectCoverage: false,

  // An array of glob patterns indicating a set of files for which coverage information should
  // be collected.
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],

  // The directory where Jest should output its coverage files.
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection.
  coveragePathIgnorePatterns: ['/node_modules/'],

  // A list of reporter names that Jest uses when writing coverage reports.
  coverageReporters: ['json', 'text', 'lcov', 'clover', 'html'],

  // The test environment that will be used for testing.
  testEnvironment: 'node',
  testTimeout: 15000,

  // A map from regular expressions to paths to transformers.
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },

  setupFilesAfterEnv: ['jest-extended'],

  testRegex: '^.*.(spec|test).ts$',

  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/__utils__/'],
};
