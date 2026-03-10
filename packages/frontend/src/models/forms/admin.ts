/**
 * Form input models for admin operations
 * These represent the shape of data collected from forms before being sent to the API
 */

export interface AdminCreateRacerInput {
  name: string;
  team: string;
  teamColor: string;
  nationality: string;
  age: number;
  active?: boolean;
  badgeUrl?: string;
  profileUrl?: string;
  /** Optional: assign racer to a specific user account */
  userId?: string;
}
