import { Router } from "express";
import container from "../../containers/container";

const router = Router();
const leaderboardController = container.createLeaderboardController();

// GET /api/leaderboard/current
router.get("/current", (req, res) => {
  leaderboardController.getCurrentSeason(req, res);
});

// GET /api/leaderboard/season/:seasonId
router.get("/season/:seasonId", (req, res) => {
  leaderboardController.getBySeason(req, res);
});

// GET /api/leaderboard/alltime
router.get("/alltime", (req, res) => {
  leaderboardController.getAllTime(req, res);
});

export { router as leaderboardRouter };
