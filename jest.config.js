module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['dist', 'fixtures'],
  verbose: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: ['fixtures'],
  reporters: [
    'default',
    [
      './node_modules/jest-html-reporter',
      {
        pageTitle: 'Test Report',
      },
    ],
  ],
  "globals": {
    "window": {}
  }
};
