import { UserRole } from "../constants";
import { Racer } from "./racer";

// User domain models
export interface User {
  id: string;
  racerId?: string;
  googleId: string;
  email: string;
  name: string;
  profilePicture?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  racer?: Racer; // 1-to-1 relationship with Racer, optional because not all users may be racers. Essential for allowing authorized user to manager their racer profile.
}

// Re-export for convenience
export type { UserRole };
