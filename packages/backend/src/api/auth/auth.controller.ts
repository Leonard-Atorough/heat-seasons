import { NextFunction, Request, Response } from "express";
import { IAuthService } from "./auth.service.interface";
import { JwtService, TokenPayload } from "src/Infrastructure/security/jwt";
import { UserResponse } from "src/application/dtos/user.dto";
import { ApiResponse } from "shared";

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
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        return;
      }

      const token = this.authService.generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
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
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
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
