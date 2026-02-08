import { StorageAdapter } from "../../storage/";
import { UserCreateInput } from "../../models/";
import { User } from "@shared/index";
import { IAuthRepository } from "./auth.repository.interface";

export class AuthRepository implements IAuthRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.storageAdapter.findAll<User>("users");
    } catch (error) {
      throw new Error("Failed to find all users");
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const users = await this.storageAdapter.findAll<User>("users");
      return users.find((user) => user.id === id) || null;
    } catch (error) {
      throw new Error("Failed to find user by ID");
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.storageAdapter.findAll<User>("users");
      return users.find((user) => user.email === email) || null;
    } catch (error) {
      throw new Error("Failed to find user by email");
    }
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      const users = await this.storageAdapter.findAll<User>("users");
      return users.find((user) => user.googleId === googleId) || null;
    } catch (error) {
      throw new Error("Failed to find user by Google ID");
    }
  }

  async create(data: UserCreateInput): Promise<User> {
    try {
      const users = await this.storageAdapter.findAll<User>("users");
      const newUser: User = {
        id: Math.random().toString(36).substring(7),
        googleId: data.googleId,
        email: data.email,
        name: data.name,
        profilePicture: data.profilePicture,
        role: data.role || "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedUsers = [...users, newUser];
      await this.storageAdapter.create("users", updatedUsers);
      return newUser;
    } catch (error) {
      throw new Error("Failed to create user");
    }
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    try {
      const users = await this.storageAdapter.findAll<User>("users");
      const userIndex = users.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        throw new Error("User not found");
      }
      const updatedUser = { ...users[userIndex], ...data, updatedAt: new Date() };
      users[userIndex] = updatedUser;
      await this.storageAdapter.create("users", users);
      return updatedUser;
    } catch (error) {
      throw new Error("Failed to update user");
    }
  }
}
