import { UserRole, User } from "@shared/index";

export interface UserCreateInput extends Omit<User, "id" | "createdAt" | "updatedAt"> {}

export interface UserUpdateInput extends Partial<Omit<User, "id" | "createdAt" | "updatedAt">> {}

export interface UserResponse extends Omit<User, "googleId" | "updatedAt"> {}
