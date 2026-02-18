import { LeaderboardEntry } from "shared";

export interface ILeaderboardRepository {
  getCurrentSeason(): Promise<LeaderboardEntry[]>;
  getBySeason(seasonId: string): Promise<LeaderboardEntry[]>;
  getAllTime(): Promise<any[]>;
}
