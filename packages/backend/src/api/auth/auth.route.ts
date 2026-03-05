import { Request, Response, NextFunction, Router } from "express";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { Container } from "src/Infrastructure/dependency-injection/container";
import { authMiddleware } from "src/Infrastructure/http/middleware";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 100 requests per windowMs TODO: Adjust this limit as needed
  message: "Too many authentication attempts from this IP, please try again later.",
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: "Too many login attempts from this IP, please try again later.",
});

router.get(
  "/me",
  authLimiter,
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    req.log.info({ userId: (req.user as { id: string })?.id }, "Fetching current user profile");
    const authController = Container.getInstance().createAuthController();

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
    const authController = Container.getInstance().createAuthController();
    authController.googleCallback(req, res, next);
  },
);

router.post(
  "/logout",
  authLimiter,
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    req.log.info({ userId: (req.user as { id: string })?.id }, "Logging out");
    const authController = Container.getInstance().createAuthController();
    authController.logout(req, res, next);
  },
);

export { router as authRouter };
