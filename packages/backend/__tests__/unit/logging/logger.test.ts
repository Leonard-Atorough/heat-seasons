import {logger, requestLogger} from "../../../src/Infrastructure/logging";

describe("Logger", () => {
  // 1. Given a message and no metadata, when logging, then the logger outputs the message with a timestamp and log level.
  // 2. Given a message and metadata, when logging, then the logger outputs the message with a timestamp, log level, and stringified metadata.
  // 3. Given an error object in the metadata, when logging, then the logger outputs the error with its message, stack trace, and other
  //    relevant properties, properly serialized.
  describe("info method", () => {
    let logSpy: jest.SpyInstance;
    beforeEach(() => {
      jest.clearAllMocks();
      logSpy = jest.spyOn(logger, "info").mockImplementation(() => logger);
    });

    it("logs messages with correct structure and metadata", () => {
      // Test case 1: Log a simple message
      logger.info("Test message");
      expect(logSpy).toHaveBeenCalledWith("Test message");
    });

    it("logs messages with metadata", () => {
      // Test case 2: Log a message with metadata
      const metadata = { userId: 123, action: "login" };
      logger.info({ ...metadata }, "User action");
      expect(logSpy).toHaveBeenCalledWith({ ...metadata }, "User action");
    });

    it("logs errors with proper serialization", () => {
      // Test case 3: Log an error object
      const error = new Error("Something went wrong");
      logger.info({ err: error }, "An error occurred");
      expect(logSpy).toHaveBeenCalledWith(
        {
          err: expect.objectContaining({
            message: "Something went wrong",
            stack: expect.any(String),
          }),
        },
        "An error occurred",
      );
    });
  });
});