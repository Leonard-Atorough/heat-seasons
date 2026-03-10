import { Racer } from "../../../shared/src/index";

const defaults: Racer = {
  id: "racer-1",
  userId: undefined,
  name: "John Doe",
  active: true,
  joinDate: new Date("2026-01-01T00:00:00.000Z"),
  team: "Team A",
  teamColor: "#FF0000",
  nationality: "USA",
  age: 30,
  badgeUrl: undefined,
  profileUrl: undefined,
};

export function createRacer(overrides: Partial<Racer> = {}): Racer {
  return { ...defaults, ...overrides };
}

export const racers = {
  standard: (overrides: Partial<Racer> = {}) => createRacer(overrides),

  john: (overrides: Partial<Racer> = {}) =>
    createRacer({
      id: "racer-1",
      name: "John Doe",
      team: "Team A",
      teamColor: "#FF0000",
      nationality: "USA",
      age: 30,
      ...overrides,
    }),

  jane: (overrides: Partial<Racer> = {}) =>
    createRacer({
      id: "racer-2",
      name: "Jane Smith",
      team: "Team B",
      teamColor: "#0000FF",
      nationality: "USA",
      age: 28,
      ...overrides,
    }),

  inactive: (overrides: Partial<Racer> = {}) =>
    createRacer({
      id: "racer-inactive-1",
      active: false,
      name: "Inactive Racer",
      ...overrides,
    }),

  assignedToUser: (userId: string = "user-1", overrides: Partial<Racer> = {}) =>
    createRacer({
      id: "racer-assigned-1",
      userId,
      ...overrides,
    }),
};

export function createRacerList(count: number, overrides: Partial<Racer> = {}): Racer[] {
  return Array.from({ length: count }, (_, index) =>
    createRacer({
      id: `racer-${index + 1}`,
      name: `Test Racer ${index + 1}`,
      team: `Team ${String.fromCharCode(65 + (index % 26))}`,
      teamColor: `#${(index + 1).toString(16).padStart(6, "0")}`,
      age: 20 + index,
      ...overrides,
    }),
  );
}