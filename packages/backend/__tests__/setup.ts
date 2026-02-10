import "dotenv/config";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.SESSION_SECRET = "test-session-secret-key";

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};
