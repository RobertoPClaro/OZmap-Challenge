import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Suppress console logs during tests
if (process.env.NODE_ENV === 'test') {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
}

