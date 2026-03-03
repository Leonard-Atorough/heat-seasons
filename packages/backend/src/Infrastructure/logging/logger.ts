import pino from "pino";

const isTest = process.env.NODE_ENV === "test";
const isDev = !isTest && process.env.NODE_ENV !== "production";

/**
 * Root pino logger.
 *
 * - Production: JSON to stdout (structured, machine-parseable).
 * - Development: pretty-printed via pino-pretty transport.
 * - Test: silent (no output noise during test runs).
 *
 * Per-request child loggers (with reqId) are created automatically by the
 * requestLogger middleware (pino-http).  Use `req.log` inside route handlers
 * and middleware so every log line carries the request ID.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isTest ? "silent" : "info"),
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss.l",
        ignore: "pid,hostname",
      },
    },
  }),
  base: {
    service: "heat-seasons-api",
    env: process.env.NODE_ENV ?? "development",
  },
  serializers: {
    err: pino.stdSerializers.err,
  },
});

export default logger;
