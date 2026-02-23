import "./env";
import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./Infrastructure/security/passport";

import { authRouter } from "./api/auth/auth.route.js";
import { adminRouter } from "./api/admin/admin.route.js";
import { racerRouter } from "./api/racer/racer.route.js";
import { seasonRouter } from "./api/season/season.route.js";
import { raceRouter } from "./api/race/race.route.js";
import { leaderboardRouter } from "./api/leaderboard/leaderboard.route.js";
import { AppError } from "./Infrastructure/errors/appError.js";
import { Container } from "./Infrastructure/dependency-injection/container.js";
import { handleError } from "./Infrastructure/http/middleware";

const app: Application = express();
const PORT = process.env.PORT || 3001;

const container = Container.getInstance();
container.initializeStorageAdapter().catch((error) => {
  console.error("Failed to initialize storage adapter:", error);
  process.exit(1);
});

const FRONTEND_URL = process.env.FRONTEND_URL;
if (!process.env.FRONTEND_URL) {
  console.warn(
    `Warning: FRONTEND_URL is not set. Defaulting to ${FRONTEND_URL}. This should be set in production.`,
  );
}

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error(
    //TODO: Replace with a proper logging mechanism in production
    "Warning: SESSION_SECRET is not set. Using default secret key. This should be changed in production.",
  );
}

app.use(
  session({
    secret: SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
      domain: process.env.COOKIE_DOMAIN || "localhost",
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
  console.log(`🏁 Heat Seasons API server running on port ${PORT}`);
});

export default app;
