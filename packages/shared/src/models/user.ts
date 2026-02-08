import { UserRole } from "../constants";

// User domain models
export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  profilePicture?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// User response (without sensitive data)
// Re-export for convenience
export type { UserRole };
