export class AuthService {
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

export default new AuthService();
