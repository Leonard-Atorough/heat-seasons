import { z } from "zod";

const RACER_NAME_MIN = 2;
const RACER_NAME_MAX = 100;
const RACER_TEAM_MAX = 100;
const RACER_NATIONALITY_MAX = 100;
const RACER_AGE_MIN = 8;
const RACER_AGE_MAX = 120;
const TEAM_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$|^rgb\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)$/;

/**
 * Schema for POST /api/admin/promote and POST /api/admin/demote
 * Validates that a userId is present before reaching the controller
 */
export const userRoleActionSchema = z.object({
  userId: z.string("userId is required").trim().min(1, "userId cannot be empty"),
});

/**
 * Schema for POST /api/admin/racers
 * Same validation as the racer schema but with an optional userId and active flag
 * for admin-level creation (assigning racers to arbitrary users)
 */
export const createAdminRacerSchema = z.object({
  userId: z.string().trim().min(1).optional().or(z.literal("")).transform((val) => (val === "" ? undefined : val)),

  name: z
    .string("Racer name is required")
    .trim()
    .min(RACER_NAME_MIN, `Racer name must be at least ${RACER_NAME_MIN} characters`)
    .max(RACER_NAME_MAX, `Racer name cannot exceed ${RACER_NAME_MAX} characters`),

  team: z
    .string("Team name is required")
    .trim()
    .min(1, "Team name is required")
    .max(RACER_TEAM_MAX, `Team name cannot exceed ${RACER_TEAM_MAX} characters`),

  teamColor: z
    .string("Team color is required")
    .trim()
    .refine(
      (color) => TEAM_COLOR_PATTERN.test(color),
      "Team color must be a valid hex color (e.g., #FF0000) or RGB format",
    ),

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

  active: z.boolean().optional().default(true),

  badgeUrl: z.string().url("Badge URL must be a valid URL").optional().or(z.literal("")).transform((val) => (val === "" ? undefined : val)),

  profileUrl: z.string().url("Profile URL must be a valid URL").optional().or(z.literal("")).transform((val) => (val === "" ? undefined : val)),
});

/**
 * Schema for PUT /api/admin/racers/:racerId
 * All fields optional for partial updates
 */
export const updateAdminRacerSchema = createAdminRacerSchema.partial();

/**
 * Schema for PUT/DELETE /api/admin/racers/:racerId path parameter
 */
export const adminRacerParamSchema = z.object({
  racerId: z.string().min(1, "racerId is required"),
});

export type UserRoleActionInput = z.infer<typeof userRoleActionSchema>;
export type CreateAdminRacerInput = z.infer<typeof createAdminRacerSchema>;
export type UpdateAdminRacerInput = z.infer<typeof updateAdminRacerSchema>;
export type AdminRacerParamInput = z.infer<typeof adminRacerParamSchema>;
