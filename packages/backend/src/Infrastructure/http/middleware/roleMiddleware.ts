import { TokenPayload } from "src/Infrastructure/security/jwt";
import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "shared";

export async function roleMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = req.user as TokenPayload;

  if (!user) {
    res.status(401).json({
      status: 401,
      success: false,
      statusText: "Unauthorized",
      message: "Unauthorized.",
      data: null,
    } as ApiResponse<null>);
    return;
  }

  if (user.role !== "admin") {
    res.status(403).json({
      status: 403,
      success: false,
      statusText: "Access Forbidden",
      message: "Access Forbidden.",
      data: null,
    } as ApiResponse<null>);
    return;
  }

  next();
}
