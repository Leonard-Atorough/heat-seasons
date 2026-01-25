import { Router } from "express";
import { getContainerInstance } from "../../containers/container";

const router = Router();
const leaderboardController = getContainerInstance().createLeaderboardController();

router.get("/current", (req, res, next) => {
  leaderboardController.getCurrentSeason(req, res, next);
});

router.get("/season/:seasonId", (req, res, next) => {
  leaderboardController.getBySeason(req, res, next);
});

router.get("/alltime", (req, res, next) => {
  leaderboardController.getAllTime(req, res, next);
});

export { router as leaderboardRouter };
