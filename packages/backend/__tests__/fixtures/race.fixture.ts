import { Race, RaceResult } from "../../../shared/src/index";

const defaultResult: RaceResult = {
  racerId: "racer-1",
  position: 1,
  points: 10,
  constructorPoints: 0,
  ghostRacer: false,
};

const defaults: Race = {
  id: "race-1",
  seasonId: "season-1",
  name: "Race 1",
  raceNumber: 1,
  date: new Date("2026-01-15T00:00:00.000Z"),
  completed: false,
  results: [
    defaultResult,
    {
      racerId: "racer-2",
      position: 2,
      points: 8,
      constructorPoints: 0,
      ghostRacer: false,
    },
  ],
};

export function createRaceResult(overrides: Partial<RaceResult> = {}): RaceResult {
  return { ...defaultResult, ...overrides };
}

export function createRace(overrides: Partial<Race> = {}): Race {
  return { ...defaults, ...overrides };
}

export const races = {
  race1: (overrides: Partial<Race> = {}) =>
    createRace({
      id: "race-1",
      seasonId: "season-1",
      name: "Race 1",
      raceNumber: 1,
      date: new Date("2026-01-15T00:00:00.000Z"),
      completed: false,
      results: [
        createRaceResult({ racerId: "racer-1", position: 1, points: 10 }),
        createRaceResult({ racerId: "racer-2", position: 2, points: 8 }),
      ],
      ...overrides,
    }),

  completed: (overrides: Partial<Race> = {}) =>
    createRace({
      id: "race-completed-1",
      name: "Completed Race",
      completed: true,
      results: [
        createRaceResult({ racerId: "racer-1", position: 1, points: 25, constructorPoints: 25 }),
        createRaceResult({ racerId: "racer-2", position: 2, points: 18, constructorPoints: 18 }),
      ],
      ...overrides,
    }),

  pending: (overrides: Partial<Race> = {}) =>
    createRace({
      id: "race-pending-1",
      name: "Pending Race",
      completed: false,
      results: [],
      ...overrides,
    }),
};

export function createRaceList(count: number, overrides: Partial<Race> = {}): Race[] {
  return Array.from({ length: count }, (_, index) => {
    const completed = index < count - 1;

    return createRace({
      id: `race-${index + 1}`,
      name: `Race ${index + 1}`,
      raceNumber: index + 1,
      date: new Date(2026, 0, 15 + index * 7),
      completed,
      results: completed
        ? [
            createRaceResult({ racerId: "racer-1", position: 1, points: 25, constructorPoints: 25 }),
            createRaceResult({ racerId: "racer-2", position: 2, points: 18, constructorPoints: 18 }),
          ]
        : [],
      ...overrides,
    });
  });
}