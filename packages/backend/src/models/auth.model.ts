export interface AuthTokens {
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LoginResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  token: string;
  expiresIn: number;
}

export interface RegisterResponse extends LoginResponse {}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}
