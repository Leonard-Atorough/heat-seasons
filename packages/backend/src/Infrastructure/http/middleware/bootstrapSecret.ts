import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "shared";

export function validateBootstrapSecret(req: Request, res: Response, next: NextFunction) {
  const deploymentSecret = req.headers["x-deployment-secret"];
  if (deploymentSecret !== process.env.DEPLOYMENT_SECRET) {
    res.status(403).json({
      status: 403,
      success: false,
      statusText: "Forbidden",
      message: "Forbidden: Invalid deployment secret",
      data: null,
      timestamp: new Date(),
    } as ApiResponse<null>);
  }
  next();
}
