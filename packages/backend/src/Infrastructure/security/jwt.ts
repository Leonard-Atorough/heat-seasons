import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "shared";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../env.js";

export interface TokenPayload extends JwtPayload {
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
    return jwt.sign(
      payload,
      JWT_SECRET as string,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
    );
  }

  static verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET as string) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}
