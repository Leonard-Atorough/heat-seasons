import { Leaderboard } from "shared";

export interface ILeaderboardService {
  getCurrentSeasonLeaderboard(): Promise<Leaderboard>;
  getSeasonLeaderboard(seasonId: string): Promise<Leaderboard>;
  getAllTimeStats(): Promise<any[]>;
}
