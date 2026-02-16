// Racer domain models
export interface Racer {
  id: string;
  userId?: string; // Optional userId to link to a User, but not required for all racers
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
