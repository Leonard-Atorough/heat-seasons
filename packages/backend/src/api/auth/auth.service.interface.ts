import { UserCreateInput, UserResponse } from "../../models/user.model";

export interface IAuthService {
  getMe(userId: string): Promise<UserResponse>;
  generateToken(user: UserResponse): string;
  findOrCreateUser(profile: UserCreateInput): Promise<UserResponse>;
  logout(token: string): Promise<void>;
}
