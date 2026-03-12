import { z } from "zod";

/**
 * Common validation rules for racer data
 */
const RACER_NAME_MIN = 2;
const RACER_NAME_MAX = 100;
const RACER_TEAM_MIN = 1;
const RACER_TEAM_MAX = 100;
const RACER_NATIONALITY_MAX = 100;
const RACER_AGE_MIN = 8;
const RACER_AGE_MAX = 120;
const TEAM_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$|^rgb\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)$/;

/**
 * Schema for POST /api/racers - Create new racer
 */
export const createRacerSchema = z.object({
  name: z
    .string("Racer name is required")
    .trim()
    .min(RACER_NAME_MIN, `Racer name must be at least ${RACER_NAME_MIN} characters`)
    .max(RACER_NAME_MAX, `Racer name cannot exceed ${RACER_NAME_MAX} characters`),

  team: z
    .string("Team name is required")
    .trim()
    .min(RACER_TEAM_MIN, "Team name is required")
    .max(RACER_TEAM_MAX, `Team name cannot exceed ${RACER_TEAM_MAX} characters`),

  nationality: z
    .string("Nationality is required")
    .trim()
    .min(2, "Nationality must be at least 2 characters")
    .max(RACER_NATIONALITY_MAX, `Nationality cannot exceed ${RACER_NATIONALITY_MAX} characters`),

  age: z
    .number("Age must be a number")
    .int("Age must be a whole number")
    .min(RACER_AGE_MIN, `Age must be at least ${RACER_AGE_MIN}`)
    .max(RACER_AGE_MAX, `Age cannot exceed ${RACER_AGE_MAX}`),

  teamColor: z
    .string("Team color is required")
    .trim()
    .refine(
      (color) => TEAM_COLOR_PATTERN.test(color),
      "Team color must be a valid hex color (e.g., #FF0000) or RGB format",
    ),

  badgeUrl: z.url("Badge URL must be a valid URL").optional().or(z.literal("")).transform((val) => (val === "" ? undefined : val)),

  profileUrl: z.url("Profile URL must be a valid URL").optional().or(z.literal("")).transform((val) => (val === "" ? undefined : val)),

  active: z.boolean().optional(),
});

/**
 * Schema for PUT /api/racers/:id - Update racer
 */
export const updateRacerSchema = createRacerSchema.partial();

/**
 * Schema for racer ID parameter
 */
export const racerIdSchema = z.object({
  id: z.string().min(1, "Racer ID is required"),
});

export type CreateRacerInput = z.infer<typeof createRacerSchema>;
export type UpdateRacerInput = z.infer<typeof updateRacerSchema>;
export type RacerIdInput = z.infer<typeof racerIdSchema>;
