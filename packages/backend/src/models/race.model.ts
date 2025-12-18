export interface RaceResult {
  id: string;
  raceId: string;
  racerId: string;
  racerName: string;
  position: number;
  points: number;
}

export interface Race {
  id: string;
  seasonId: string;
  raceNumber: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RaceWithResults extends Race {
  results: RaceResult[];
}

export interface RaceResultInput {
  racerId: string;
  position: number;
}

export interface RaceCreateInput {
  seasonId: string;
  date: Date;
  results: RaceResultInput[];
}

export interface RaceUpdateInput {
  date?: Date;
  results?: RaceResultInput[];
}
