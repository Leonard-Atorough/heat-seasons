import { Request, Response } from "express";
import { IAuthService } from "./auth.service.interface";
import { JwtService } from "../../utils/jwt";
import { UserResponse } from "src/models/user.model";
import { ApiResponse } from "@shared/index";

export class AuthController {
  constructor(private authService: IAuthService) {}

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const token = authHeader.substring(7);
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

      const token = this.authService.generateToken(user);
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=token_generation_failed`);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.status(200).json({ message: "Logged out successfully" });
  }
}
