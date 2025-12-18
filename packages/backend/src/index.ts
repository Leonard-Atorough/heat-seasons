import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import racerRoutes from "./routes/racers.routes.js";
import seasonRoutes from "./routes/seasons.routes.js";
import raceRoutes from "./routes/races.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Heat Seasons API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/racers", racerRoutes);
app.use("/api/seasons", seasonRoutes);
app.use("/api/races", raceRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Error handling middleware
interface AppError extends Error {
  status?: number;
  code?: string;
}

app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    code: err.code || "INTERNAL_ERROR",
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
