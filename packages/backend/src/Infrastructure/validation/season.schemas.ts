import { z } from "zod";

/**
 * Common validation rules for season data
 */
const SEASON_NAME_MIN = 2;
const SEASON_NAME_MAX = 100;

/**
 * Schema for POST /api/seasons - Create new season
 */
export const createSeasonSchema = z.object({
  name: z
    .string("Season name is required")
    .trim()
    .min(SEASON_NAME_MIN, `Season name must be at least ${SEASON_NAME_MIN} characters`)
    .max(SEASON_NAME_MAX, `Season name cannot exceed ${SEASON_NAME_MAX} characters`),

  status: z.enum(["upcoming", "active", "completed", "archived"] as const).default("upcoming"),

  startDate: z
    .string({ message: "Start date is required" })
    .refine((date) => !isNaN(Date.parse(date)), "Invalid start date format")
    .transform((date) => new Date(date)),

  endDate: z
    .string({ message: "End date is required" })
    .refine((date) => !isNaN(Date.parse(date)), "Invalid end date format")
    .transform((date) => new Date(date))
    .optional(),
});

/**
 * Schema for PUT /api/seasons/:id - Update season
 */
export const updateSeasonSchema = createSeasonSchema.partial();

/**
 * Schema for GET /api/seasons/:id - Season ID parameter
 */
export const seasonIdSchema = z.object({
  id: z.string().min(1, "Season ID is required"),
});

export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;
export type UpdateSeasonInput = z.infer<typeof updateSeasonSchema>;
export type SeasonIdInput = z.infer<typeof seasonIdSchema>;
