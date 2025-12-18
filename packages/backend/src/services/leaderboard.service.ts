import { LeaderboardEntry } from "shared";

export class LeaderboardService {
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

export default new LeaderboardService();
