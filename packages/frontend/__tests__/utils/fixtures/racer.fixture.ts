import { RacerWithStats, Racer } from "shared";

/**
 * Default RacerWithStats fixture - standard racer with stats
 */
const defaultsWithStats: RacerWithStats = {
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

/**
 * Default Racer fixture - without stats
 */
const defaultsRacer: Racer = {
  id: "racer-1",
  userId: "user-1",
  name: "Lewis Hamilton",
  team: "Mercedes AMG",
  teamColor: "#00d2be",
  nationality: "British",
  age: 39,
  active: true,
  joinDate: new Date("2024-01-01"),
  badgeUrl: undefined,
  profileUrl: undefined,
};

/**
 * Create a RacerWithStats fixture with optional overrides
 * @example
 * const racer = createRacerWithStats({ name: "Max Verstappen" });
 */
export function createRacerWithStats(overrides: Partial<RacerWithStats> = {}): RacerWithStats {
  return { ...defaultsWithStats, ...overrides };
}

/**
 * Create a Racer fixture (without stats) with optional overrides
 * @example
 * const racer = createRacer({ name: "Charles Leclerc", team: "Ferrari" });
 */
export function createRacer(overrides: Partial<Racer> = {}): Racer {
  return { ...defaultsRacer, ...overrides };
}

/**
 * Pre-built racer scenarios for common test cases
 */
export const racers = {
  /** Racer with high performance stats */
  highPerformer: () =>
    createRacerWithStats({
      id: "racer-winner",
      name: "Max Verstappen",
      team: "Red Bull Racing",
      teamColor: "#0600ef",
      nationality: "Dutch",
      age: 27,
      stats: {
        totalPoints: 450,
        totalRaces: 12,
        wins: 10,
        podiums: 12,
        avgPosition: 1.2,
      },
    }),

  /** Racer with low performance stats */
  lowPerformer: () =>
    createRacerWithStats({
      id: "racer-novice",
      name: "Oscar Piastri",
      team: "McLaren",
      teamColor: "#ff8700",
      nationality: "Australian",
      age: 23,
      stats: {
        totalPoints: 20,
        totalRaces: 12,
        wins: 0,
        podiums: 0,
        avgPosition: 8.5,
      },
    }),

  /** Inactive racer */
  inactive: () =>
    createRacerWithStats({
      id: "racer-retired",
      name: "Sebastian Vettel",
      active: false,
      stats: {
        totalPoints: 3000,
        totalRaces: 300,
        wins: 53,
        podiums: 150,
        avgPosition: 3.5,
      },
    }),

  /** Racer with profile picture and badge */
  withMedia: () =>
    createRacerWithStats({
      id: "racer-media",
      badgeUrl: "https://example.com/badge.png",
      profileUrl: "https://example.com/profile.jpg",
    }),
};

/**
 * Create multiple racers with stats for list scenarios
 * @example
 * const allRacers = createRacerWithStatsList(5);
 */
export function createRacerWithStatsList(
  count: number,
  overrides: Partial<RacerWithStats>[] = [],
): RacerWithStats[] {
  const teams = [
    { name: "Mercedes AMG", color: "#00d2be" },
    { name: "Red Bull Racing", color: "#0600ef" },
    { name: "Ferrari", color: "#dc0000" },
    { name: "McLaren", color: "#ff8700" },
    { name: "Alpine", color: "#0082fa" },
  ];

  return Array.from({ length: count }, (_, i) => {
    const team = teams[i % teams.length];
    return createRacerWithStats({
      id: `racer-${i + 1}`,
      userId: `user-${i + 1}`,
      name: `Racer ${i + 1}`,
      team: team.name,
      teamColor: team.color,
      nationality: `Country${i + 1}`,
      age: 25 + (i % 15),
      ...overrides[i],
    });
  });
}

/**
 * Create multiple racers (without stats) for list scenarios
 * @example
 * const allRacers = createRacerList(5);
 */
export function createRacerList(
  count: number,
  overrides: Partial<Racer>[] = [],
): Racer[] {
  const teams = [
    { name: "Mercedes AMG", color: "#00d2be" },
    { name: "Red Bull Racing", color: "#0600ef" },
    { name: "Ferrari", color: "#dc0000" },
    { name: "McLaren", color: "#ff8700" },
    { name: "Alpine", color: "#0082fa" },
  ];

  return Array.from({ length: count }, (_, i) => {
    const team = teams[i % teams.length];
    return createRacer({
      id: `racer-${i + 1}`,
      userId: `user-${i + 1}`,
      name: `Racer ${i + 1}`,
      team: team.name,
      teamColor: team.color,
      nationality: `Country${i + 1}`,
      age: 25 + (i % 15),
      ...overrides[i],
    });
  });
}

/**
 * Build a Map<racerId, { name, team }> suitable for ResultsTable component
 * @example
 * const racerMap = createRacerMap([racer1, racer2]);
 */
export function createRacerMap(racers: Racer[]): Map<string, { name: string; team: string }> {
  return new Map(racers.map((r) => [r.id, { name: r.name, team: r.team }]));
}

