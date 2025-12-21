export interface IAuthService {
  register(email: string, password: string, name: string): Promise<any>;
  login(email: string, password: string): Promise<any>;
  refreshToken(refreshToken: string): Promise<any>;
  logout(token: string): Promise<void>;
  verifyToken(token: string): Promise<any>;
}
