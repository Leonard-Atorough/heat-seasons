import { Leaderboard } from "@shared/index";

export interface ILeaderboardService {
  getCurrentSeasonLeaderboard(): Promise<Leaderboard>;
  getSeasonLeaderboard(seasonId: string): Promise<Leaderboard>;
  getAllTimeStats(): Promise<any[]>;
}
