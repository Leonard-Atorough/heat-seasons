import { User } from "shared";

// TODO: Deprecate in favour of entity partials
export interface UserCreateInput extends Omit<User, "id" | "createdAt" | "updatedAt"> {}

// TODO: Deprecate in favour of partials
export interface UserUpdateInput extends Partial<Omit<User, "id" | "createdAt" | "updatedAt">> {}

export interface UserResponse extends Omit<User, "googleId" | "createdAt" | "updatedAt"> {}
