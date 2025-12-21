import { JsonStorageAdapter } from "../../storage/index.js";
import { User } from "../../models/user.model.js";

export class AuthRepository {
  async findAll(): Promise<User[]> {
    try {
      const storage = new JsonStorageAdapter();
      return await storage.findAll<User>("users");
    } catch (error) {
      throw new Error("Not implemented");
    }
  }

  async findById(id: string): Promise<User | null> {
    throw new Error("Not implemented");
  }

  async findByEmail(email: string): Promise<User | null> {
    throw new Error("Not implemented");
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

export default new AuthRepository();
