import { Request, Response } from "express";
import { IAuthService } from "./auth.service.interface";
import { JwtService } from "../../utils/jwt";
import { UserResponse } from "src/models/user.model";
import { ApiResponse } from "@shared/index";

export class AuthController {
  constructor(private authService: IAuthService) {}

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies.token;
      if (!token) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const payload = JwtService.verifyToken(token);
      if (!payload) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }

      const user = await this.authService.getMe(payload.id);
      const response: ApiResponse<UserResponse> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        data: user,
      };
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        res.status(404).json({ error: "User not found" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user) {
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        return;
      }

      // Q. This should really be set as a httponly cookie right?
      // A. Yes
      // Let's set the token as an HTTP-only cookie to enhance security.
      // Q. Cors should be configured to allow credentials and the frontend should send requests with credentials to include the cookie, right?
      // A. Yes, CORS should be configured to allow credentials, and the frontend should send requests with credentials to include the cookie.
      const token = this.authService.generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=token_generation_failed`);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
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
  }
}
