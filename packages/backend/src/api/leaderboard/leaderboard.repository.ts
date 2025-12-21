import { StorageAdapter } from "../../storage/";
import { LeaderboardEntry } from "shared";
import { ILeaderboardRepository } from "./leaderboard.repository.interface.js";

export class LeaderboardRepository implements ILeaderboardRepository {
  constructor(private storageAdapter: StorageAdapter) {}

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
