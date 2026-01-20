import { Request, Response } from "express";
import { IAuthService } from "./auth.service.interface";
import { env } from "process";

export class AuthController {
  constructor(private authService: IAuthService) {}

  /**
   *
   * @param {string} req - Express Request object
   * @param {string} res - Express Response object
   * @returns {Promise<void>} 
   */
  async getMe(req: Request, res: Response): Promise<void> {
    let userId: string | undefined;
    try {
      if (env.NODE_ENV === "test" || env.NODE_ENV === "development") {
        userId = (req.query.userId as string) || (req.headers["x-user-id"] as string);
      } else {
        // In Production we would extract userId from a verified token in our Auth middleware and attach it to req.user
        userId = (req as any).user?.id; //TODO: Proper typing and implementation
      }
      if (!userId) {
        res.status(401).json({ error: "User ID not provided" });
        return;
      }

      const user = await this.authService.getMe(userId);
      res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        res.status(404).json({ error: "User not found" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    try {
      const tokens = await this.authService.login(email, password);
      res.status(200).json(tokens);
    } catch (error) {
      res.status(401).json({ error: "Invalid credentials" });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }
}
