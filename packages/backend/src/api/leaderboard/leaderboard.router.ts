import { Router } from "express";

const router = Router();

// GET /api/leaderboard/current
router.get("/current", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// GET /api/leaderboard/season/:seasonId
router.get("/season/:seasonId", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// GET /api/leaderboard/alltime
router.get("/alltime", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

export default router;
