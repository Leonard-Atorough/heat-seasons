export interface CreateBootstrapConfig {
  expirationMinutes: number;
}

export interface BootstrapConfigResponse {
  bootstrapToken: string;
  expiresAt: Date;
}

export interface CreateBootstrapAdminUserInput {
  token: string;
  googleId: string;
  email: string;
  name: string;
}

export interface CreateBootstrapAdminUserResponse {
  id: string;
  googleId: string;
  email: string;
  name: string;
  role: string;
}
