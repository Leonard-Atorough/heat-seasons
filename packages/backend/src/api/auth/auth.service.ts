import { IAuthRepository } from "./auth.repository.interface";
import { IAuthService } from "./auth.service.interface";
import { UserResponse } from "../../models/user.model";

export class AuthService implements IAuthService {
  constructor(private authRepository: IAuthRepository) {}

  async getMe(userId: string): Promise<UserResponse> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async register(email: string, password: string, name: string): Promise<any> {
    throw new Error("Not implemented");
  }

  async login(email: string, password: string): Promise<any> {
    const user = await this.authRepository.findByEmail(email);
    if (!user || user.password !== password) {
      throw new Error("Invalid credentials");
    }
    return {
      accessToken: "dummy-access-token",
      refreshToken: "dummy-refresh-token",
    };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    throw new Error("Not implemented");
  }

  async logout(token: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async verifyToken(token: string): Promise<any> {
    throw new Error("Not implemented");
  }
}
