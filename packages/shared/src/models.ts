import { SeasonStatus } from ".";

// Generic API response interface
export interface ApiResponse<T> {
  success: boolean;
  timestamp: Date;
  message?: string;
  error?: string;
  data: T;
}

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Racer related interfaces
export interface Racer {
  id: string;
  name: string;
  active: boolean;
  joinDate: Date;
  team: string;
  teamColor: string;
  nationality: string;
  age: number;
  badgeUrl?: string;
  profileUrl?: string;
}

export interface RacerStats {
  totalRaces: number;
  wins: number;
  podiums: number;
  avgPosition: number;
  totalPoints: number;
}

export interface RacerWithStats extends Racer {
  stats: RacerStats | null;
}

// Season related interfaces
export interface Season {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  status: SeasonStatus;
}

export interface SeasonWithStats extends Season {
  raceCount: number;
  participantCount: number;
}

// Race reated interfaces
export interface RaceResult {
  racerId: string;
  position: number;
  points: number;
}

export interface Race {
  id: string;
  seasonId: string;
  raceNumber: number;
  date: Date;
  results: RaceResult[];
}

// Leaderboard related interfaces
export interface LeaderboardEntry {
  racerId: string;
  racerName: string;
  totalPoints: number;
  racesParticipated: number;
  wins: number;
  podiums: number;
  positions: number[];
  avgPosition: number;
}
