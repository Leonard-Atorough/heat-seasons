/**
 * Frontend Models Barrel Export
 *
 * This package centralizes all frontend-specific models and extensions,
 * organized into three categories:
 *
 * - extended/   Types that extend shared models with frontend-specific fields
 * - forms/      Form input/validation DTOs (frontend-only)
 * - viewModels/ UI-specific models with no backend equivalent
 */

export type { AdminUser } from "./extended";
export type { AdminCreateRacerInput, SeasonRequest } from "./forms";
export type { Team } from "./viewModels";
