// This file contains setup code that will be executed before each test
// It's useful for setting up global test environment configurations

// Increase timeout for all tests
jest.setTimeout(30000);

// You can add more global setup here as needed
// For example, handling unhandled promise rejections during tests
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection during test execution:', reason);
});

// Clean up any global mocks after each test
afterEach(() => {
  jest.restoreAllMocks();
});

// Add environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_USERNAME = 'root';
process.env.DB_PASSWORD = '123456';
process.env.DB_DATABASE = 'darien_technology_test';
process.env.JWT_SECRET = 'test-secret';
