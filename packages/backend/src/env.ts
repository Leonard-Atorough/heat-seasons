import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

function requiredEnv(name: string): string | undefined {
  const v = process.env[name];
  if (isProd && !v) {
    throw new Error(
      `${name} must be set in production. Add it as a GitHub repository secret (Settings → Secrets and variables → Actions).`,
    );
  }
  return v;
}

function envWithDefault(name: string, defaultValue: string): string {
  const v = requiredEnv(name);
  if (!v) {
    console.warn(
      `[env] ${name} is not set — falling back to insecure default. Do NOT use this in production.`,
    );
    return defaultValue;
  }
  return v;
}

export const JWT_SECRET = envWithDefault("JWT_SECRET", "dev-secret-key-change-in-production");
export const SESSION_SECRET = envWithDefault(
  "SESSION_SECRET",
  "dev-session-secret-change-in-production",
);
export const FRONTEND_URL = envWithDefault("FRONTEND_URL", "http://localhost:5173");
export const COOKIE_DOMAIN = envWithDefault("COOKIE_DOMAIN", "localhost");
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// Google OAuth — empty-string defaults are intentional for local dev
// (OAuth simply won't work without real credentials).
export const GOOGLE_CLIENT_ID = envWithDefault("GOOGLE_CLIENT_ID", "");
export const GOOGLE_CLIENT_SECRET = envWithDefault("GOOGLE_CLIENT_SECRET", "");
export const GOOGLE_CALLBACK_URL = envWithDefault(
  "GOOGLE_CALLBACK_URL",
  "http://localhost:3001/api/auth/google/callback",
);
