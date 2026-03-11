import { UserCreateInput, UserResponse } from "../../application/dtos/user.dto.js";
import { User, UserRole } from "shared";

export interface IAuthService {
  getMe(userId: string): Promise<UserResponse>;
  generateToken(user: User): string;
  upsertUser(profile: UserCreateInput): Promise<UserResponse>;
  logout(token: string): Promise<void>;
  isTokenValid(token: string): Promise<boolean>;
  updateUserRole(userId: string, role: UserRole): Promise<UserResponse>;
  getAllUsers(): Promise<UserResponse[]>;
}
