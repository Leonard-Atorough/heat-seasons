import { Race } from "shared";

export const mockRaceData: Race = {
  id: "race-1",
  name: "Monaco GP",
  seasonId: "season-1",
  raceNumber: 1,
  date: new Date("2025-06-15"),
  completed: true,
  results: [
    { racerId: "racer-1", position: 1, points: 25, constructorPoints: 25 },
    { racerId: "racer-2", position: 2, points: 18, constructorPoints: 18 },
  ],
};

/**** Factory to produce a `Race` with optional overrides. ****/
export function createMockRace(overrides: Partial<Race> = {}): Race {
  return { ...mockRaceData, ...overrides };
}
