import { ILeaderboardRepository } from "./leaderboard.repository.interface.js";
import { ILeaderboardService } from "./leaderboard.service.interface.js";
import { LeaderboardEntry } from "shared";

export class LeaderboardService implements ILeaderboardService {
  constructor(private leaderboardRepository: ILeaderboardRepository) {}

  async getCurrentSeasonLeaderboard(): Promise<LeaderboardEntry[]> {
    throw new Error("Not implemented");
  }

  async getSeasonLeaderboard(seasonId: string): Promise<LeaderboardEntry[]> {
    throw new Error("Not implemented");
  }

  async getAllTimeStats(): Promise<any[]> {
    throw new Error("Not implemented");
  }
}
