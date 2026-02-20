import { IAuthRepository } from "src/domain/repositories/auth.repository.interface";
import { IAuthService } from "./auth.service.interface";
import { UserResponse, UserCreateInput } from "src/application/dtos/user.dto";
import { User } from "shared";
import { JwtService } from "../../utils/jwt";
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
        role: profile.role,
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
    await this.authRepository.logout(token);
  }

  async isTokenValid(token: string): Promise<boolean> {
    // Business logic: A token is valid if it's not blacklisted
    const isBlacklisted = await this.authRepository.isTokenBlacklisted(token);
    return !isBlacklisted;
  }

  // async include<T>(data: T): Promise<T> {
  //   // This method can be used to include related data if needed.
  //   // For now, it simply returns the data as is.
  //   return data;
  // }
}
