import { Request, Response } from "express";
import { ILeaderboardService } from "./leaderboard.service.interface.js";

export class LeaderboardController {
  constructor(private leaderboardService: ILeaderboardService) {}

  async getCurrentSeason(req: Request, res: Response): Promise<void> {
    console.log("Fetching current season leaderboard");
    try {
      const leaderboard = await this.leaderboardService.getCurrentSeasonLeaderboard();
      res.status(200).json(leaderboard);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No races found for current season") {
          res.status(404).json({ error: error.message });
          return;
        } else if (error.message === "No racers found for leaderboard") {
          res.status(404).json({ error: error.message });
          return;
        } else if (error.message === "Current season not found") {
          res.status(404).json({ error: error.message });
          return;
        }
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async getBySeason(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async getAllTime(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }
}
