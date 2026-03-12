import z from "zod";

const raceResultsSchema = z.array(
  z.object({
    racerId: z.string().min(1, "Racer ID is required"),
    position: z.number().int().min(1, "Position must be at least 1"),
  }),
);

const createRaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Race name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  date: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid race date format"),

  completed: z.boolean().optional().default(false),

  results: raceResultsSchema.optional().default([]),
});

export const updateRaceSchema = createRaceSchema.partial().extend({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
});

export const raceIdSchema = z.object({
  id: z.string().min(1, "Race ID is required"),
});

export type CreateRaceInput = z.infer<typeof createRaceSchema>;
export type UpdateRaceInput = z.infer<typeof updateRaceSchema>;
export type RaceIdInput = z.infer<typeof raceIdSchema>;
