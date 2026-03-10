import { User } from "shared";

/**
 * Extended User model with admin-specific fields
 * Used in admin panels for displaying user login statistics
 */
export interface AdminUser extends User {
  lastLoginAt?: string;
  loginCount: number;
}
