import { z } from "zod";

const TEAM_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$|^rgb\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)$/;

export const createRacerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Racer name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  team: z
    .string()
    .trim()
    .min(1, "Team name is required")
    .max(100, "Team name cannot exceed 100 characters"),

  nationality: z
    .string()
    .trim()
    .min(1, "Nationality is required")
    .min(2, "Nationality must be at least 2 characters")
    .max(100, "Nationality cannot exceed 100 characters"),

  age: z
    .number("Age must be a number")
    .int("Age must be a whole number")
    .min(8, "Age must be at least 8")
    .max(120, "Age cannot exceed 120"),

  teamColor: z
    .string()
    .trim()
    .min(1, "Team color is required")
    .refine(
      (color) => TEAM_COLOR_PATTERN.test(color),
      "Team color must be a valid hex (e.g. #FF0000) or RGB format",
    ),

  active: z.boolean().optional().default(true),

  badgeUrl: z
    .url("Badge URL must be a valid URL")
    .optional()
    .or(z.literal("")),

  profileUrl: z
    .url("Profile URL must be a valid URL")
    .optional()
    .or(z.literal("")),

  userId: z.string().trim().optional().or(z.literal("")),
});

export const updateRacerSchema = createRacerSchema.partial().extend({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
});

export type CreateRacerInput = z.infer<typeof createRacerSchema>;
export type UpdateRacerInput = z.infer<typeof updateRacerSchema>;
