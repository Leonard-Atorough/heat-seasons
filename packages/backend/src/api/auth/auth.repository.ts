import { StorageAdapter } from "../../storage/";
import { User } from "../../models/";
import { IAuthRepository } from "./auth.repository.interface";

export class AuthRepository implements IAuthRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.storageAdapter.findAll<User>("users");
    } catch (error) {
      throw new Error("Not implemented");
    }
  }

  async findById(id: string): Promise<User | null> {
    throw new Error("Not implemented");
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.storageAdapter.findAll<User>("users");
      return users.find((user) => user.email === email) || null;
    } catch (error) {
      throw new Error("Not implemented");
    }
  }

  async create(data: Omit<User, "id" | "createdAt">): Promise<User> {
    throw new Error("Not implemented");
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }
}
