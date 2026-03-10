import { Season } from "../../../shared/src/index";

const defaults: Season = {
  id: "season-1",
  name: "Season 1 2026",
  status: "active",
  startDate: new Date("2026-01-01T00:00:00.000Z"),
  endDate: undefined,
};

export function createSeason(overrides: Partial<Season> = {}): Season {
  return { ...defaults, ...overrides };
}

export const seasons = {
  active: (overrides: Partial<Season> = {}) =>
    createSeason({
      id: "season-1",
      name: "Season 1 2026",
      status: "active",
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      ...overrides,
    }),

  upcoming: (overrides: Partial<Season> = {}) =>
    createSeason({
      id: "season-upcoming-1",
      name: "Season 2 2026",
      status: "upcoming",
      startDate: new Date("2026-06-01T00:00:00.000Z"),
      endDate: undefined,
      ...overrides,
    }),

  completed: (overrides: Partial<Season> = {}) =>
    createSeason({
      id: "season-completed-1",
      name: "Season 0 2025",
      status: "completed",
      startDate: new Date("2025-01-01T00:00:00.000Z"),
      endDate: new Date("2025-05-01T00:00:00.000Z"),
      ...overrides,
    }),
};

export function createSeasonList(count: number, overrides: Partial<Season> = {}): Season[] {
  const statuses: Season["status"][] = ["upcoming", "active", "completed", "archived"];

  return Array.from({ length: count }, (_, index) =>
    createSeason({
      id: `season-${index + 1}`,
      name: `Season ${index + 1} 202${6 - Math.floor(index / statuses.length)}`,
      status: statuses[index % statuses.length],
      startDate: new Date(2026, index, 1),
      endDate: index % statuses.length === 0 ? undefined : new Date(2026, index + 1, 1),
      ...overrides,
    }),
  );
}
