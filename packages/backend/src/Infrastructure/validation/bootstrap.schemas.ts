import { z } from "zod";

/**
 * Schema for POST /api/bootstrap/token
 * Generates a one-time bootstrap token for system initialization
 */
export const generateBootstrapTokenSchema = z.object({
  expirationMinutes: z
    .number()
    .int("Expiration must be a whole number")
    .min(1, "Expiration must be at least 1 minute")
    .max(10080, "Expiration cannot exceed 7 days (10080 minutes)")
    .optional()
    .default(30),
});

export type GenerateBootstrapTokenInput = z.infer<typeof generateBootstrapTokenSchema>;

/**
 * Schema for POST /api/bootstrap/admin
 * Completes system bootstrap by creating the first admin user
 * Prerequisites:
 * - System must not already be bootstrapped
 * - Valid bootstrap token must be provided
 */
export const bootstrapSystemSchema = z.object({
  token: z
    .string("Bootstrap token is required")
    .trim()
    .min(1, "Bootstrap token cannot be empty")
    .max(500, "Bootstrap token has invalid format"),

  googleId: z
    .string("Google ID is required")
    .trim()
    .min(1, "Google ID cannot be empty")
    .max(255, "Google ID exceeds maximum length"),

  email: z.email("Valid email is required").max(255, "Email exceeds maximum length"),

  name: z
    .string("Name is required")
    .trim()
    .min(1, "Name cannot be empty")
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name exceeds maximum length"),
});

export type BootstrapSystemInput = z.infer<typeof bootstrapSystemSchema>;
