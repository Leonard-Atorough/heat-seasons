import { UserCreateInput } from "../../models/";
import { User } from "@shared/index";

export interface IAuthRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: UserCreateInput): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
}
