import { IAuthRepository } from "./auth.repository.interface";
import { IAuthService } from "./auth.service.interface";

export class AuthService implements IAuthService {
  constructor(private authRepository: IAuthRepository) {}

  async register(email: string, password: string, name: string): Promise<any> {
    throw new Error("Not implemented");
  }

  async login(email: string, password: string): Promise<any> {
    throw new Error("Not implemented");
  }

  async refreshToken(refreshToken: string): Promise<any> {
    throw new Error("Not implemented");
  }

  async logout(token: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async verifyToken(token: string): Promise<any> {
    throw new Error("Not implemented");
  }
}
