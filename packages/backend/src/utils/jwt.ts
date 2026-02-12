import jwt from "jsonwebtoken";
import { User } from "@shared/index";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";
if (!process.env.JWT_SECRET) {
  // TODO: Replace with a proper logging mechanism in production
  console.warn(
    "Warning: JWT_SECRET is not set. Using default secret key. This should be changed in production.",
  );
}
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "24h";

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export class JwtService {
  static generateToken(user: User): string {
    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  }

  static verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}
