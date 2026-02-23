import { IAuthRepository } from "src/domain/repositories/auth.repository.interface";
import { IAuthService } from "./auth.service.interface";
import { UserResponse, UserCreateInput } from "src/application/dtos/user.dto";
import { User, UserRole } from "shared";
import { JwtService } from "src/Infrastructure/security/jwt";
import { UserMapper } from "src/application/mappers/userMapper";

export class AuthService implements IAuthService {
  constructor(private authRepository: IAuthRepository) {}

  async getMe(userId: string): Promise<UserResponse> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return UserMapper.toResponse(user);
  }

  async upsertUser(profile: UserCreateInput): Promise<UserResponse> {
    let user = await this.authRepository.findByGoogleId(profile.googleId);

    if (!user) {
      // Create NEW entity (no ID yet) - mapper converts DTO to domain entity
      const newUserEntity = UserMapper.toDomain(profile);
      user = await this.authRepository.create(newUserEntity);
    } else {
      // Update EXISTING entity (already has ID)
      user.update({
        email: profile.email,
        name: profile.name,
        role: user.role || "user", // Preserve existing role or default to "user"
        profilePicture: profile.profilePicture,
        racerId: profile.racerId,
      });
      user = await this.authRepository.update(user.id!, user);
    }

    return UserMapper.toResponse(user);
  }

  generateToken(user: User): string {
    return JwtService.generateToken(user);
  }

  async logout(token: string): Promise<void> {
    const decoded = JwtService.verifyToken(token);
    let ttl = 60 * 60; // Default to 1 hour
    if (decoded) {
      ttl = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 60 * 60; // Default to 1 hour if no exp
    }
    await this.authRepository.logout(token, ttl);
  }

  async isTokenValid(token: string): Promise<boolean> {
    // Business logic: A token is valid if it's not blacklisted
    const isBlacklisted = await this.authRepository.isTokenBlacklisted(token);
    return !isBlacklisted;
  }

  async updateUserRole(userId: string, role: UserRole): Promise<UserResponse> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.update({ role });
    const updated = await this.authRepository.update(userId, user);
    return UserMapper.toResponse(updated);
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await this.authRepository.findAll();
    return users.map((user) => UserMapper.toResponse(user));
  }
}
