import { Request, Response, NextFunction } from "express";
import { UserRole } from "shared";
import { ApiResponse } from "shared";
import { TokenPayload } from "../../security/jwt";

/**
 * Middleware factory to require specific user roles
 * Usage: app.get('/admin', requireRole('admin'), controller.handler)
 *
 * @example
 * protectedRouter.post("/promote", requireRole("admin"), (req, res) => {
 *   adminController.promoteUser(req, res);
 * });
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as TokenPayload | undefined;

    if (!user) {
      res.status(401).json({
        status: 401,
        success: false,
        statusText: "Unauthorized",
        message: "No user found in request",
        data: null,
        timestamp: new Date(),
      } as ApiResponse<null>);
      return;
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      res.status(403).json({
        status: 403,
        success: false,
        statusText: "Forbidden",
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
        data: null,
        timestamp: new Date(),
      } as ApiResponse<null>);
      return;
    }

    next();
  };
}
