import { UserRole } from "../constants";

// User domain models
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

// User response (without sensitive data)
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

// Re-export for convenience
export type { UserRole };
