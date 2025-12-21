import { LeaderboardEntry } from "shared";

export class LeaderboardRepository {
  async getCurrentSeason(): Promise<LeaderboardEntry[]> {
    throw new Error("Not implemented");
  }

  async getBySeason(seasonId: string): Promise<LeaderboardEntry[]> {
    throw new Error("Not implemented");
  }

  async getAllTime(): Promise<any[]> {
    throw new Error("Not implemented");
  }
}

export default new LeaderboardRepository();
