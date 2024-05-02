/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*Service.ts'],
  setupFilesAfterEnv: ['<rootDir>/config/singleton.ts'],
};
