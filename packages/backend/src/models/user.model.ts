import { UserRole } from "shared";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface UserUpdateInput {
  email?: string;
  name?: string;
  role?: UserRole;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}
