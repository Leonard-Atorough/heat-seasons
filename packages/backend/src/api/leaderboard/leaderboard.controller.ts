import { NextFunction, Request, Response } from "express";
import { ILeaderboardService } from "./leaderboard.service.interface.js";
import { ApiError, ApiResponse, Leaderboard } from "@shared/models";
import { LeaderboardEntry } from "shared";

export class LeaderboardController {
  constructor(private leaderboardService: ILeaderboardService) {}

  async getCurrentSeason(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const leaderboard = await this.leaderboardService.getCurrentSeasonLeaderboard();

      const response: ApiResponse<Leaderboard> = {
        success: true,
        timestamp: new Date(),
        message: `Successfully retrieved leaderboard with ${leaderboard.standings.length} entries`,
        data: leaderboard,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getBySeason(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async getAllTime(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }
}
