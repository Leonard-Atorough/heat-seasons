import pinoHttp from "pino-http";
import { randomUUID } from "node:crypto";
import { logger } from "./logger.js";

/**
 * pino-http request logging middleware.
 *
 * Attaches a child logger to every request as `req.log` so that route handlers
 * and downstream middleware can log with the request ID automatically included:
 *
 *   req.log.info({ userId }, "User fetched profile");
 *
 * Request ID is taken from the incoming `x-request-id` header when present
 * (useful for propagating traces from a proxy / frontend), otherwise a fresh
 * UUID is generated and sent back in the response header.
 *
 * Health-check requests are excluded from access logging to avoid log noise.
 */
export const requestLogger = pinoHttp({
  logger,

  genReqId(req, res) {
    const existing = req.headers["x-request-id"];
    if (existing) return Array.isArray(existing) ? existing[0] : existing;
    const id = randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },

  // Skip access log for the health endpoint.
  autoLogging: {
    ignore: (req) => req.url === "/api/health",
  },

  // Trim the serialised shapes to what's actually useful.
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
      };
    },
    res(res) {
      return { statusCode: res.statusCode };
    },
  },
});
