import { RacerWithStats, Racer } from "shared";

export const mockRacer: RacerWithStats = {
  id: "racer-1",
  userId: "user-1",
  name: "Lewis Hamilton",
  active: true,
  joinDate: new Date("2024-01-15"),
  team: "Mercedes AMG",
  teamColor: "#00d2be",
  nationality: "British",
  age: 39,
  badgeUrl: undefined,
  profileUrl: undefined,
  stats: {
    totalPoints: 180,
    totalRaces: 12,
    wins: 4,
    podiums: 8,
    avgPosition: 2.5,
  },
};

/** Factory to produce a `RacerWithStats` with optional overrides. */
export function createMockRacer(overrides: Partial<RacerWithStats> = {}): RacerWithStats {
  return { ...mockRacer, ...overrides };
}

// Fixtures for plain Racer type (used in AddRaceResultsModal)
export const mockRacers: Racer[] = [
  {
    id: "racer-1",
    name: "Lewis Hamilton",
    team: "Mercedes AMG",
    teamColor: "#00d2be",
    nationality: "British",
    age: 39,
    active: true,
    joinDate: new Date("2024-01-01"),
  },
  {
    id: "racer-2",
    name: "Max Verstappen",
    team: "Red Bull",
    teamColor: "#0600ef",
    nationality: "Dutch",
    age: 27,
    active: true,
    joinDate: new Date("2024-01-01"),
  },
];
