import { z } from "zod";

const RACE_NAME_MIN = 2;
const RACE_NAME_MAX = 100;

/**
 * Schema for POST /api/races body
 * Note: seasonId comes from the query string, not the body
 */
export const createRaceSchema = z.object({
  name: z
    .string("Race name is required")
    .trim()
    .min(RACE_NAME_MIN, `Race name must be at least ${RACE_NAME_MIN} characters`)
    .max(RACE_NAME_MAX, `Race name cannot exceed ${RACE_NAME_MAX} characters`),

  date: z
    .string("Race date is required")
    .refine((date) => !isNaN(Date.parse(date)), "Invalid race date format"),

  completed: z.boolean().optional().default(false),

  results: z.array(z.unknown()).optional().default([]),
});

/**
 * Schema for PUT /api/races/:id body
 */
export const updateRaceSchema = createRaceSchema.partial();

/**
 * Schema for race ID path parameter
 */
export const raceIdSchema = z.object({
  id: z.string().min(1, "Race ID is required"),
});

export type CreateRaceInput = z.infer<typeof createRaceSchema>;
export type UpdateRaceInput = z.infer<typeof updateRaceSchema>;
export type RaceIdInput = z.infer<typeof raceIdSchema>;

