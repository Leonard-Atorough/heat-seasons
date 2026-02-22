import { Request, Response } from "express";
import { TokenPayload } from "src/Infrastructure/security/jwt";
import { ApiResponse } from "shared";
import { IAuthService } from "../auth/auth.service.interface";
import { UserResponse } from "src/application/dtos/user.dto";

/**
 * Admin-only controller for managing user roles
 * All methods require admin authentication via requireRole("admin") middleware
 */
export class AdminController {
  constructor(private authService: IAuthService) {}

  /**
   * Promote a user to contributor role
   * Only admins can promote users
   */
  async promoteUser(req: Request, res: Response): Promise<void> {
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
      const response: ApiResponse<null> = {
        success: false,
        status: 500,
        statusText: "Internal Server Error",
        timestamp: new Date(),
        error: "Internal server error",
        message: "Failed to promote user",
        data: null,
      };
      res.status(500).json(response);
    }
  }

  /**
   * Demote a contributor user to regular user role
   * Only admins can demote other contributors
   */
  async demoteUser(req: Request, res: Response): Promise<void> {
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
      const response: ApiResponse<null> = {
        success: false,
        status: 500,
        statusText: "Internal Server Error",
        timestamp: new Date(),
        error: "Internal server error",
        message: "Failed to demote user",
        data: null,
      };
      res.status(500).json(response);
    }
  }

  /**
   * List all users (admin only)
   */
  async listUsers(req: Request, res: Response): Promise<void> {
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
      const response: ApiResponse<null> = {
        success: false,
        status: 500,
        statusText: "Internal Server Error",
        timestamp: new Date(),
        error: "Internal server error",
        message: "Failed to fetch users",
        data: null,
      };
      res.status(500).json(response);
    }
  }
}
