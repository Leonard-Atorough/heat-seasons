import { Request, Response, NextFunction, Router } from "express";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { Container } from "src/Infrastructure/dependency-injection/container";
import { authMiddleware } from "src/Infrastructure/http/middleware";
import { AuthController } from "./auth.controller";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs TODO: Adjust this limit as needed
  message: "Too many authentication attempts from this IP, please try again later.",
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: "Too many login attempts from this IP, please try again later.",
});

export interface CreateAuthRouterOptions {
  authController?: AuthController;
}

export function createAuthRouter(options: CreateAuthRouterOptions = {}): Router {
  const router = Router();
  const authController = options.authController ?? Container.getInstance().createAuthController();

  router.get(
    "/me",
    authLimiter,
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      req.log.info({ userId: (req.user as { id: string })?.id }, "Fetching current user profile");
      authController.getMe(req, res, next);
    },
  );

  router.get(
    "/google",
    loginLimiter,
    passport.authenticate("google", { scope: ["profile", "email"] }),
  );

  router.get(
    "/google/callback",
    loginLimiter,
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req: Request, res: Response, next: NextFunction) => {
      req.log.info({ userId: (req.user as { id: string })?.id }, "Google callback");
      authController.googleCallback(req, res, next);
    },
  );

  router.post(
    "/logout",
    authLimiter,
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      req.log.info({ userId: (req.user as { id: string })?.id }, "Logging out");
      authController.logout(req, res, next);
    },
  );

  return router;
}
