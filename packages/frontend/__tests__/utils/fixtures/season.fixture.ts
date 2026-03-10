import { SeasonRequest } from "src/models"
import { Season, type SeasonStatus } from "shared";

/**
 * Default Season fixture - upcoming season
 */
const defaults: Season = {
  id: "season-1",
  name: "Summer 2024",
  status: "upcoming" as SeasonStatus,
  startDate: new Date("2024-06-01"),
  endDate: undefined,
};

/**
 * Create a Season fixture with optional overrides
 * @example
 * const season = createSeason({ name: "Winter 2025" });
 * const activeSeason = createSeason({ status: "active" });
 */
export function createSeason(overrides: Partial<Season> = {}): Season {
  return { ...defaults, ...overrides };
}

/**
 * Default SeasonRequest fixture for form submissions
 */
const defaultRequest: SeasonRequest = {
  name: "Summer 2024",
  startDate: "2024-06-01",
};

/**
 * Create a SeasonRequest fixture with optional overrides
 * @example
 * const request = createSeasonRequest({ name: "Winter 2025" });
 */
export function createSeasonRequest(overrides: Partial<SeasonRequest> = {}): SeasonRequest {
  return { ...defaultRequest, ...overrides };
}

/**
 * Pre-built season scenarios for common test cases
 */
export const seasons = {
  /** Upcoming season (default) */
  upcoming: () =>
    createSeason({
      id: "season-upcoming",
      name: "Winter 2025",
      status: "upcoming" as SeasonStatus,
      startDate: new Date("2025-12-01"),
    }),

  /** Currently active season */
  active: () =>
    createSeason({
      id: "season-active",
      name: "Summer 2024",
      status: "active" as SeasonStatus,
      startDate: new Date("2024-06-01"),
      endDate: new Date("2024-08-31"),
    }),

  /** Completed season */
  completed: () =>
    createSeason({
      id: "season-completed",
      name: "Spring 2024",
      status: "completed" as SeasonStatus,
      startDate: new Date("2024-03-01"),
      endDate: new Date("2024-05-31"),
    }),

  /** Archived season */
  archived: () =>
    createSeason({
      id: "season-archived",
      name: "Winter 2023",
      status: "archived" as SeasonStatus,
      startDate: new Date("2023-12-01"),
      endDate: new Date("2024-02-29"),
    }),
};

/**
 * Create multiple seasons for list scenarios
 * @example
 * const allSeasons = createSeasonList(5);
 */
export function createSeasonList(count: number, overrides: Partial<Season> = {}): Season[] {
  const statuses: SeasonStatus[] = ["upcoming", "active", "completed", "archived"];
  const baseYear = 2024;

  return Array.from({ length: count }, (_, i) => {
    const year = baseYear - Math.floor(i / 4);
    const season = i % 4;
    const status = statuses[season];

    return createSeason({
      id: `season-${i + 1}`,
      name: `Season ${i + 1} (${year})`,
      status,
      startDate: new Date(`${year}-${(season * 3 + 1).toString().padStart(2, "0")}-01`),
      endDate: new Date(`${year}-${((season + 1) * 3).toString().padStart(2, "0")}-28`),
      ...overrides,
    });
  });
}

/**
 * @deprecated Use createSeasonRequest() instead
 */
export const __createSeasonRequest_deprecated = () => createSeasonRequest();
