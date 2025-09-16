#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const testType = args[0] || 'all';

const testCommands = {
  'all': 'jest',
  'unit': 'jest --testPathPattern="__tests__/(controller|dto|utils)"',
  'integration': 'jest --testPathPattern="__tests__/integration"',
  'controller': 'jest --testPathPattern="__tests__/controller"',
  'dto': 'jest --testPathPattern="__tests__/dto"',
  'validation': 'jest --testPathPattern="__tests__/utils/validation"',
  'watch': 'jest --watch',
  'coverage': 'jest --coverage',
  'help': () => {
    console.log(`
Available test commands:
  npm run test:all          - Run all tests
  npm run test:unit         - Run unit tests only
  npm run test:integration  - Run integration tests only
  npm run test:controller   - Run controller tests only
  npm run test:dto          - Run DTO tests only
  npm run test:validation   - Run validation tests only
  npm run test:watch        - Run tests in watch mode
  npm run test:coverage     - Run tests with coverage report
  npm run test:help         - Show this help message
    `);
    process.exit(0);
  }
};

if (testCommands[testType]) {
  if (typeof testCommands[testType] === 'function') {
    testCommands[testType]();
  } else {
    try {
      execSync(testCommands[testType], { stdio: 'inherit' });
    } catch (error) {
      console.error(`Test command failed: ${error.message}`);
      process.exit(1);
    }
  }
} else {
  console.error(`Unknown test type: ${testType}`);
  console.log('Run "npm run test:help" for available options');
  process.exit(1);
}
