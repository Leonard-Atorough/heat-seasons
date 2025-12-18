export interface LeaderboardEntry {
  position: number;
  racerId: string;
  racerName: string;
  totalPoints: number;
  racesParticipated: number;
  wins: number;
  podiums: number;
  avgPosition: number;
  lastRacePosition?: number;
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
