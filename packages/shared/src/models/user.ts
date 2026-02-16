import { UserRole } from "../constants";

// User domain models
export interface User {
  id: string;
  racerId?: string;
  googleId: string;
  email: string;
  name: string;
  profilePicture?: string;
  role: UserRole;
}
// Re-export for convenience
export type { UserRole };
