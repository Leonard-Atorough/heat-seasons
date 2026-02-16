import { IAuthRepository } from "./auth.repository.interface";
import { IAuthService } from "./auth.service.interface";
import { UserResponse, UserCreateInput } from "../../models/user.model";
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
    // For JWT, we can't truly "logout" on the server side without a token blacklist.
    // In a real implementation, you might store the token in a blacklist with an expiration time.
    // For this example, we'll just simulate logout by doing nothing.
    return;
  }

  // async include<T>(data: T): Promise<T> {
  //   // This method can be used to include related data if needed.
  //   // For now, it simply returns the data as is.
  //   return data;
  // }
}
