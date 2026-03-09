import { Request, Response, NextFunction, Router } from "express";
import rateLimit from "express-rate-limit";
import { Container } from "src/Infrastructure/dependency-injection/container";
import { authMiddleware, requireRole } from "src/Infrastructure/http/middleware";

const adminRouter = Router();

// All admin routes require authentication + admin role
adminRouter.use(authMiddleware);
adminRouter.use(requireRole("admin"));

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many admin requests, please try again later.",
});

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
adminRouter.get("/users", adminLimiter, (req: Request, res: Response, next: NextFunction) => {
  req.log.info({ userId: (req.user as { id: string })?.id }, "Listing all users");
  const adminController = Container.getInstance().createAdminController();
  adminController.listUsers(req, res, next);
});

/**
 * POST /api/admin/promote
 * Promote a user to contributor role
 *
 * Body: { userId: string }
 */
adminRouter.post("/promote", adminLimiter, (req: Request, res: Response, next: NextFunction) => {
  req.log.info(
    { userId: (req.user as { id: string })?.id, promoteUserId: req.body.userId },
    "Promoting user to contributor",
  );
  const adminController = Container.getInstance().createAdminController();
  adminController.promoteUser(req, res, next);
});

/**
 * POST /api/admin/demote
 * Demote a contributor user to regular user role
 *
 * Body: { userId: string }
 */
adminRouter.post("/demote", adminLimiter, (req: Request, res: Response, next: NextFunction) => {
  req.log.info(
    { userId: (req.user as { id: string })?.id, demoteUserId: req.body.userId },
    "Demoting user to regular",
  );
  const adminController = Container.getInstance().createAdminController();
  adminController.demoteUser(req, res, next);
});

/**
 * POST /api/admin/racers
 * Create a racer on behalf of any user (admin only)
 *
 * Body: racer fields + optional userId
 */
adminRouter.post("/racers", adminLimiter, (req: Request, res: Response, next: NextFunction) => {
  req.log.info(
    { adminId: (req.user as { id: string })?.id, assignedUserId: req.body.userId },
    "Admin creating racer",
  );
  const adminController = Container.getInstance().createAdminController();
  adminController.createRacer(req, res, next);
});

export { adminRouter };
