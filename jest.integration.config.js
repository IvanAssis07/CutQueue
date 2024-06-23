/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    setupFilesAfterEnv: ['<rootDir>/config/integration-setup.ts'],
    globalSetup: '<rootDir>/config/jest.global-setup.ts',
    globalTeardown: '<rootDir>/config/jest.global-teardown.ts',
    testMatch: ['**/?(*.)+(spec|test).integration.ts'],
  };