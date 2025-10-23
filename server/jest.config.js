module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js', '**/?(*.)+(spec|test).js'],
  transform: { '^.+\\.jsx?$': 'babel-jest' },
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testTimeout: 15000
};