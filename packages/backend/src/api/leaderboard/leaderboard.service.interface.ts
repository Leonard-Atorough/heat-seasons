import { LeaderboardEntry } from "shared";

export interface ILeaderboardService {
  getCurrentSeasonLeaderboard(): Promise<LeaderboardEntry[]>;
  getSeasonLeaderboard(seasonId: string): Promise<LeaderboardEntry[]>;
  getAllTimeStats(): Promise<any[]>;
}
