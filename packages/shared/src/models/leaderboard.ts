// Leaderboard domain models
export interface LeaderboardEntry {
  racerId: string;
  racerName: string;
  team: string;
  totalPoints: number;
  racesParticipated: number;
  wins: number;
  podiums: number;
  positions: number[];
  avgPosition: number;
}

export interface Leaderboard {
  seasonId: string;
  seasonName: string;
  asOfDate: Date;
  standings: LeaderboardEntry[];
}

export interface AllTimeStats {
  racerId: string;
  racerName: string;
  totalPoints: number;
  totalRaces: number;
  totalWins: number;
  totalPodiums: number;
  avgPosition: number;
  seasonsParticipated: number;
}
