import { UserCreateInput, UserResponse } from "src/application/dtos/user.dto";
import { UserRole } from "shared";

export interface IAuthService {
  getMe(userId: string): Promise<UserResponse>;
  generateToken(user: UserResponse): string;
  upsertUser(profile: UserCreateInput): Promise<UserResponse>;
  logout(token: string): Promise<void>;
  isTokenValid(token: string): Promise<boolean>;
  updateUserRole(userId: string, role: UserRole): Promise<UserResponse>;
  getAllUsers(): Promise<UserResponse[]>;
}
