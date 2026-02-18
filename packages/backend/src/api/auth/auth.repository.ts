import { StorageAdapter } from "../../storage/";
import { IAuthRepository } from "./auth.repository.interface";
import { UserEntity } from "@src/domain/entities/UserEntity";
import { UserMapper } from "@src/application/mappers/userMapper";
import { randomUUID } from "crypto";

export class AuthRepository implements IAuthRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async findAll(): Promise<UserEntity[]> {
    const users = await this.storageAdapter.findAll<any>("users");
    return (users || []).map((user) => UserMapper.toDomainFromPersistence(user));
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.storageAdapter.findById<any>("users", id);
    return user ? UserMapper.toDomainFromPersistence(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const users = await this.storageAdapter.findAll<any>("users");
    const user = users.find((user) => user.email === email);
    return user ? UserMapper.toDomainFromPersistence(user) : null;
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    const users = await this.storageAdapter.findAll<any>("users");
    const user = users.find((user) => user.googleId === googleId);
    return user ? UserMapper.toDomainFromPersistence(user) : null;
  }

  async create(entity: UserEntity): Promise<UserEntity> {
    const dataToSave = {
      ...UserMapper.toPersistence(entity),
      // Storage adapter will generate an ID.
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.storageAdapter.create("users", dataToSave);
    return UserMapper.toDomainFromPersistence(saved);
  }

  async update(id: string, entity: UserEntity): Promise<UserEntity> {
    const dataToUpdate = {
      ...UserMapper.toPersistence(entity),
      updatedAt: new Date(),
    };

    const updated = await this.storageAdapter.update("users", id, dataToUpdate);
    return UserMapper.toDomainFromPersistence(updated);
  }

  async logout(token: string): Promise<void> {
    await this.storageAdapter.create("blacklistedTokens", {
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000 * 24), // 1 day
    });
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedTokens = await this.storageAdapter.findAll<any>("blacklistedTokens");
    return blacklistedTokens.some((t) => t.token === token);
  }
}
