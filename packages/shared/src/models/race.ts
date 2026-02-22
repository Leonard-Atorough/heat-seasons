// Race domain models
export interface RaceResult {
  racerId: string;
  position: number;
  points: number;
  constructorPoints: number;
}

export interface Race {
  id: string;
  name: string;
  seasonId: string;
  raceNumber: number;
  date: Date;
  results: RaceResult[];
}
