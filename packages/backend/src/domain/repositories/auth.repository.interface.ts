import { UserEntity } from "../entities/UserEntity";

export interface IAuthRepository {
  findAll(): Promise<UserEntity[]>;
  findById(id: string): Promise<UserEntity | null>;
  findByGoogleId(googleId: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: Partial<UserEntity>): Promise<UserEntity>;
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;
  logout(token: string, ttl: number): Promise<void>;
  isTokenBlacklisted(token: string): Promise<boolean>;
}
