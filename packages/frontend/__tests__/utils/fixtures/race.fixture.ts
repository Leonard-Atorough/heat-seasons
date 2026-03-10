import { Race } from "shared";

/**
 * Default Race fixture - completed race with results
 */
const defaults: Race = {
  id: "race-1",
  name: "Monaco GP",
  seasonId: "season-1",
  raceNumber: 1,
  date: new Date("2025-06-15"),
  completed: true,
  results: [
    { racerId: "racer-1", position: 1, points: 25, constructorPoints: 25 },
    { racerId: "racer-2", position: 2, points: 18, constructorPoints: 18 },
    { racerId: "racer-3", position: 3, points: 15, constructorPoints: 15 },
  ],
};

/**
 * Create a Race fixture with optional overrides
 * @example
 * const race = createRace({ name: "Silverstone", raceNumber: 2 });
 * const pending = createRace({ completed: false, results: [] });
 */
export function createRace(overrides: Partial<Race> = {}): Race {
  return { ...defaults, ...overrides };
}

/**
 * Pre-built race scenarios for common test cases
 */
export const races = {
  /** Completed race with results */
  completed: () =>
    createRace({
      id: "race-completed",
      name: "Silverstone",
      raceNumber: 2,
      date: new Date("2024-07-07"),
      completed: true,
      results: [
        { racerId: "racer-1", position: 1, points: 25, constructorPoints: 25 },
        { racerId: "racer-2", position: 2, points: 18, constructorPoints: 18 },
        { racerId: "racer-3", position: 3, points: 15, constructorPoints: 15 },
      ],
    }),

  /** Pending race with no results yet */
  pending: () =>
    createRace({
      id: "race-pending",
      name: "Monza",
      raceNumber: 3,
      date: new Date("2024-09-01"),
      completed: false,
      results: [],
    }),

  /** Race with single winner */
  singleWinner: () =>
    createRace({
      id: "race-single",
      name: "Spa",
      raceNumber: 4,
      date: new Date("2024-08-25"),
      completed: true,
      results: [{ racerId: "racer-1", position: 1, points: 25, constructorPoints: 25 }],
    }),

  /** Race with many racers */
  fullField: () =>
    createRace({
      id: "race-full",
      name: "Hungaroring",
      raceNumber: 5,
      completed: true,
      results: Array.from({ length: 9 }, (_, i) => ({
        racerId: `racer-${i + 1}`,
        position: i + 1,
        points: Math.max(0, 26 - (i + 1)),
        constructorPoints: Math.max(0, 26 - (i + 1)),
      })),
    }),
};

/**
 * Create multiple races for list scenarios
 * @example
 * const season = createRaceList(12);
 */
export function createRaceList(count: number, overrides: Partial<Race> = {}): Race[] {
  return Array.from({ length: count }, (_, i) => {
    const isCompleted = i < count - 2; // Last 2 races are pending
    return createRace({
      id: `race-${i + 1}`,
      name: `Race ${i + 1}`,
      raceNumber: i + 1,
      seasonId: "season-1",
      date: new Date(2024, 6, (i + 1) * 7), // Spaced 1 week apart
      completed: isCompleted,
      results: isCompleted
        ? [
            { racerId: "racer-1", position: 1, points: 25, constructorPoints: 25 },
            { racerId: "racer-2", position: 2, points: 18, constructorPoints: 18 },
            { racerId: "racer-3", position: 3, points: 15, constructorPoints: 15 },
          ]
        : [],
      ...overrides,
    });
  });
}


