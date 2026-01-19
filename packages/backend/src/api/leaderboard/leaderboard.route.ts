import { Router } from "express";
import { getContainerInstance } from "../../containers/container";

const router = Router();
const leaderboardController = getContainerInstance().createLeaderboardController();

router.get("/current", (req, res) => {
  leaderboardController.getCurrentSeason(req, res);
});

router.get("/season/:seasonId", (req, res) => {
  leaderboardController.getBySeason(req, res);
});

router.get("/alltime", (req, res) => {
  leaderboardController.getAllTime(req, res);
});

export { router as leaderboardRouter };
