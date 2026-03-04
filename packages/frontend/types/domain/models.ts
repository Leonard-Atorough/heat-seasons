export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  role: "admin" | "user" | "contributor";
}

export interface SeasonRequest {
  name: string;
  startDate: string; // ISO date string
}
