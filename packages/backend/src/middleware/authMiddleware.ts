import { Request, Response, NextFunction } from "express";
import { JwtService } from "../../src/utils/jwt";
import { ApiResponse } from "shared";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
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
    console.log("Authenticated user:", payload);
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
