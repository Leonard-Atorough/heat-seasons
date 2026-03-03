import { FRONTEND_URL, SESSION_SECRET, COOKIE_DOMAIN, COOKIE_SECURE } from "./env";
import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./Infrastructure/security/passport";
import { logger } from "./Infrastructure/logging/logger";
import { requestLogger } from "./Infrastructure/logging/requestLogger";

import { authRouter } from "./api/auth/auth.route.js";
import { adminRouter } from "./api/admin/admin.route.js";
import { racerRouter } from "./api/racer/racer.route.js";
import { seasonRouter } from "./api/season/season.route.js";
import { raceRouter } from "./api/race/race.route.js";
import { leaderboardRouter } from "./api/leaderboard/leaderboard.route.js";
import { Container } from "./Infrastructure/dependency-injection/container.js";
import { handleError } from "./Infrastructure/http/middleware";

const app: Application = express();
const PORT = process.env.PORT || 3001;

const container = Container.getInstance();
container.initializeStorageAdapter().catch((error) => {
  logger.error({ err: error }, "Failed to initialize storage adapter");
  process.exit(1);
});

// FRONTEND_URL is validated/loaded from `src/env.ts`.
logger.info(
  {
    corsOrigin: FRONTEND_URL,
    cookieSecure: COOKIE_SECURE,
    cookieDomain: COOKIE_DOMAIN || "<current hostname>",
  },
  "CORS and cookie configuration",
);

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

// SESSION_SECRET is validated/loaded from `src/env.ts`.

app.use(
  session({
    secret: SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: COOKIE_SECURE,
      httpOnly: true,
      // "strict" is safe for the session cookie: it is set server-side after
      // the OAuth redirect completes, not during the redirect itself.
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
      // Omit domain attribute when empty so the browser binds the cookie to
      // the exact hostname. Set COOKIE_DOMAIN to share across subdomains.
      ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Heat Seasons API is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/racers", racerRouter);
app.use("/api/seasons", seasonRouter);
app.use("/api/races", raceRouter);
app.use("/api/leaderboard", leaderboardRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  handleError(err, req, res, next);
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    code: "NOT_FOUND",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Heat Seasons API server running");
});

export default app;
