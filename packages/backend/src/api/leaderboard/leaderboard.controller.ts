import { Request, Response } from "express";
import { ILeaderboardService } from "./leaderboard.service.interface.js";

export class LeaderboardController {
  constructor(private leaderboardService: ILeaderboardService) {}

  async getCurrentSeason(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async getBySeason(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async getAllTime(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }
}
