/**
 * Form input models for season operations
 * These represent the shape of data collected from forms before being sent to the API
 */

export interface SeasonRequest {
  name: string;
  startDate: string; // ISO date string
}
