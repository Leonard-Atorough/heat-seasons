import { NextFunction, Request, Response } from "express";
import { TokenPayload } from "src/Infrastructure/security/jwt";
import { ApiResponse } from "shared";
import { IAuthService } from "../auth/auth.service.interface";
import { IRacerService } from "../racer/racer.service.interface";
import { UserResponse } from "src/application/dtos/user.dto";
import { Racer } from "shared";

/**
 * Admin-only controller for managing user roles and racer creation
 * All methods require admin authentication via requireRole("admin") middleware
 */
export class AdminController {
  constructor(
    private authService: IAuthService,
    private racerService: IRacerService,
  ) {}

  /**
   * Promote a user to contributor role
   * Only admins can promote users
   */
  async promoteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      const requestingUser = req.user as TokenPayload;

      if (!userId) {
        res.status(400).json({
          status: 400,
          success: false,
          statusText: "Bad Request",
          message: "userId is required",
          data: null,
          timestamp: new Date(),
        } as ApiResponse<null>);
        return;
      }

      // Prevent self-promotion (optional safety check)
      if (userId === requestingUser.id) {
        res.status(400).json({
          status: 400,
          success: false,
          statusText: "Bad Request",
          message: "Cannot promote yourself",
          data: null,
          timestamp: new Date(),
        } as ApiResponse<null>);
        return;
      }

      // Update user role to contributor
      const updatedUser = await this.authService.updateUserRole(userId, "contributor");

      const response: ApiResponse<UserResponse> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        data: updatedUser,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Demote a contributor user to regular user role
   * Only admins can demote other contributors
   */
  async demoteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      const requestingUser = req.user as TokenPayload;

      if (!userId) {
        res.status(400).json({
          status: 400,
          success: false,
          statusText: "Bad Request",
          message: "userId is required",
          data: null,
          timestamp: new Date(),
        } as ApiResponse<null>);
        return;
      }

      // Prevent self-demotion (safety check)
      if (userId === requestingUser.id) {
        res.status(400).json({
          status: 400,
          success: false,
          statusText: "Bad Request",
          message: "Cannot demote yourself",
          data: null,
          timestamp: new Date(),
        } as ApiResponse<null>);
        return;
      }

      const updatedUser = await this.authService.updateUserRole(userId, "user");

      const response: ApiResponse<UserResponse> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        data: updatedUser,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all users (admin only)
   */
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.authService.getAllUsers();

      const response: ApiResponse<UserResponse[]> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        data: users,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a racer as admin — allows specifying any userId (or none)
   * Body: racer fields + optional userId to assign ownership
   */
  async createRacer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, ...racerFields } = req.body;

      const { name, team, teamColor, nationality, age } = racerFields;
      if (!name || !team || !teamColor || !nationality || age === undefined) {
        res.status(400).json({
          status: 400,
          success: false,
          statusText: "Bad Request",
          message: "name, team, teamColor, nationality and age are required",
          data: null,
          timestamp: new Date(),
        } as ApiResponse<null>);
        return;
      }

      const newRacer = await this.racerService.create({
        ...racerFields,
        userId: userId ?? null,
        active: racerFields.active ?? true,
      });

      const response: ApiResponse<Racer> = {
        success: true,
        status: 201,
        statusText: "Created",
        timestamp: new Date(),
        data: newRacer,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}
