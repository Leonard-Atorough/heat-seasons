// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  CONTRIBUTOR: "contributor",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Season status
export const SEASON_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;

export type SeasonStatus = (typeof SEASON_STATUS)[keyof typeof SEASON_STATUS];

// Race constraints
export const RACE_CONSTRAINTS = {
  MIN_RACERS: 2,
  MAX_RACERS: 9,
  MIN_RACES_PER_SEASON: 4,
} as const;

// Default points system
export const DEFAULT_POINTS: Record<number, number> = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
};
