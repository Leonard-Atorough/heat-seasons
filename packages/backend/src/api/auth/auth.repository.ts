import { StorageAdapter } from "../../storage/";
import { UserCreateInput } from "../../models/";
import { User } from "@shared/index";
import { IAuthRepository } from "./auth.repository.interface";

export class AuthRepository implements IAuthRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async findAll(): Promise<User[]> {
    const users = await this.storageAdapter.findAll<User>("users");
    return users || [];
  }

  async findById(id: string): Promise<User | null> {
    const users = await this.storageAdapter.findAll<User>("users");
    return users.find((user) => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.storageAdapter.findAll<User>("users");
    return users.find((user) => user.email === email) || null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const users = await this.storageAdapter.findAll<User>("users");
    return users.find((user) => user.googleId === googleId) || null;
  }

  async create(data: UserCreateInput): Promise<User> {
    const newUser: User = {
      id: crypto.randomUUID(),
      googleId: data.googleId,
      email: data.email,
      name: data.name,
      profilePicture: data.profilePicture,
      role: data.role || "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.storageAdapter.create("users", newUser);
    return newUser;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    const updatedUser = { ...user, ...data, updatedAt: new Date() };
    await this.storageAdapter.update("users", id, updatedUser);
    return updatedUser;
  }
}
