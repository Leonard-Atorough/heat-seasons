import { NextFunction, Request, Response } from "express";
import { IAuthService } from "./auth.service.interface.js";
import { TokenPayload } from "../../Infrastructure/security/jwt.js";
import { UserResponse } from "../../application/dtos/user.dto.js";
import { ApiResponse } from "shared";
import { FRONTEND_URL, COOKIE_SECURE, COOKIE_DOMAIN } from "../../env.js";

export class AuthController {
  constructor(private authService: IAuthService) {}

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    let response: ApiResponse<UserResponse | null>;
    try {
      const payload = req.user as TokenPayload;

      const user = await this.authService.getMe(payload.id);
      response = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        data: user,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user) {
        res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
        return;
      }

      const token = this.authService.generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: COOKIE_SECURE,
        // "lax" is required for the OAuth redirect flow: when Google redirects
        // back to /api/auth/google/callback, the browser performs a top-level
        // navigation — lax allows the cookie to be set in that context.
        // "strict" would silently drop the cookie on the redirect.
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
        ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
      });
      res.redirect(`${FRONTEND_URL}/auth/callback`);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies["token"];
      if (token) {
        await this.authService.logout(token);
      }
      res.clearCookie("token", {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: "lax",
        ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
      });
      const response: ApiResponse<null> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        data: null,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
