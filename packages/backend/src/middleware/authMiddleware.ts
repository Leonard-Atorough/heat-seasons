import { Request, Response, NextFunction } from "express";
import { JwtService } from "../../src/utils/jwt";
import { ApiResponse } from "shared";
import { Container } from "../containers/container";
import { IAuthService } from "../api/auth/auth.service.interface";

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({
      status: 401,
      success: false,
      statusText: "Unauthorized",
      message: "Unauthorized: No token provided",
      data: null,
      timestamp: new Date(),
    } as ApiResponse<null>);
    return;
  }

  try {
    const payload = JwtService.verifyToken(token);
    if (!payload) {
      res.status(401).json({
        status: 401,
        success: false,
        statusText: "Unauthorized",
        message: "Unauthorized: Invalid token",
        data: null,
        timestamp: new Date(),
      } as ApiResponse<null>);
      return;
    }

    // Check if token is valid (application/business logic)
    const container = Container.getInstance();
    const authService = container.serviceLocator.get<IAuthService>("AuthService");
    const isValid = await authService.isTokenValid(token);
    if (!isValid) {
      res.status(401).json({
        status: 401,
        success: false,
        statusText: "Unauthorized",
        message: "Unauthorized: Token has been revoked",
        data: null,
        timestamp: new Date(),
      } as ApiResponse<null>);
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      status: 401,
      success: false,
      statusText: "Unauthorized",
      message: "Unauthorized: Invalid token",
      data: null,
      timestamp: new Date(),
    } as ApiResponse<null>);
  }
}
