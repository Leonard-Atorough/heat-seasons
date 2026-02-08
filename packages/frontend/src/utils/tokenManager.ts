const TOKEN_KEY = "auth_token";

export class TokenManager {
  static setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  static hasToken(): boolean {
    return !!this.getToken();
  }
}
