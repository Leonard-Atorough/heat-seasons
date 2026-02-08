import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./config/passport";

import { authRouter } from "./api/auth/auth.route.js";
import { racerRouter } from "./api/racer/racer.route.js";
import { seasonRouter } from "./api/season/season.route.js";
import { raceRouter } from "./api/race/race.route.js";
import { leaderboardRouter } from "./api/leaderboard/leaderboard.route.js";
import { AppError } from "./errors/appError.js";
import { Container } from "./containers/container";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

const container = Container.getInstance();
container
  .initializeStorageAdapter()
  .then(() => {
    console.log("Storage adapter initialized");
  })
  .catch((error) => {
    console.error("Failed to initialize storage adapter:", error);
    process.exit(1);
  });

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Heat Seasons API is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/racers", racerRouter);
app.use("/api/seasons", seasonRouter);
app.use("/api/races", raceRouter);
app.use("/api/leaderboard", leaderboardRouter);

app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(err.apiError.statusCode || 500).json({
    error: err.apiError.message || "Internal server error",
    code: err.apiError.code || "INTERNAL_ERROR",
    timestamp: new Date().toISOString(),
  });
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
