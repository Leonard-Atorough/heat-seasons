import { IAuthRepository } from "./auth.repository.interface";
import { IAuthService } from "./auth.service.interface";
import { UserResponse, UserCreateInput } from "../../models/user.model";
import { User } from "@shared/index";
import { JwtService } from "../../utils/jwt";

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
      profilePicture: user.profilePicture,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async getUser(userId: string): Promise<UserResponse | null> {
    return await this.authRepository.findById(userId);
  }

  async findOrCreateUser(profile: UserCreateInput): Promise<UserResponse> {
    let user = await this.authRepository.findById(profile.googleId);

    if (!user) {
      user = await this.authRepository.create({
        googleId: profile.googleId,
        email: profile.email,
        name: profile.name,
        profilePicture: profile.profilePicture,
        role: "user",
      });
    }

    return user;
  }

  generateToken(user: User): string {
    return JwtService.generateToken(user);
  }

  async logout(token: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async verifyToken(token: string): Promise<any> {
    throw new Error("Not implemented");
  }
}
