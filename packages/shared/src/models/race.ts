// Race domain models
export interface RaceResult {
  racerId: string;
  position: number;
  points: number;
  constructorPoints: number;
  ghostRacer?: boolean; // Optional flag to indicate if this is a ghost racer
}

export interface Race {
  id: string;
  name: string;
  seasonId: string;
  raceNumber: number;
  date: Date;
  results: RaceResult[];
}
