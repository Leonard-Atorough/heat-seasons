export interface Racer {
  id: string;
  name: string;
  email: string;
  active: boolean;
  joinDate: Date;
  updatedAt: Date;
}

export interface RacerCreateInput {
  name: string;
  email: string;
}

export interface RacerUpdateInput {
  name?: string;
  email?: string;
  active?: boolean;
}

export interface RacerStats {
  totalRaces: number;
  wins: number;
  podiums: number;
  avgPosition: number;
  totalPoints: number;
}

export interface RacerWithStats extends Racer {
  stats: RacerStats;
}
