import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";
const JWT_EXPIRES_IN = "24h";

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
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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
