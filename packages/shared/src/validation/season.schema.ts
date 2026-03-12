import z from "zod";

export const createSeasonSchema = z.object({
  name: z
    .string("Season name is required")
    .trim()
    .min(2, "Season name must be at least 2 characters")
    .max(100, "Season name cannot exceed 100 characters"),

  status: z.enum(["upcoming", "active", "completed", "archived"] as const).default("upcoming"),

  startDate: z.date("Start date must be a valid date"),

  endDate: z.date("End date must be a valid date").optional(),
});

export const updateSeasonSchema = createSeasonSchema.partial();

export const seasonIdSchema = z.object({
  id: z.string().min(1, "Season ID is required"),
});

export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;
export type UpdateSeasonInput = z.infer<typeof updateSeasonSchema>;
export type SeasonIdInput = z.infer<typeof seasonIdSchema>;