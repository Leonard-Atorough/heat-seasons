import { Request, Response, NextFunction, Router } from "express";
import rateLimit from "express-rate-limit";
import { Container } from "src/Infrastructure/dependency-injection/container";
import { authMiddleware, requireRole } from "src/Infrastructure/http/middleware";
import { AdminController } from "./admin.controller.js";

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many admin requests, please try again later.",
});

export interface CreateAdminRouterOptions {
  adminController?: AdminController;
}

export function createAdminRouter(options: CreateAdminRouterOptions = {}): Router {
  const adminRouter = Router();
  const adminController =
    options.adminController ?? Container.getInstance().createAdminController();

  // All admin routes require authentication + admin role
  adminRouter.use(authMiddleware);
  adminRouter.use(requireRole("admin"));

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
  adminRouter.get("/users", adminLimiter, (req: Request, res: Response, next: NextFunction) => {
    req.log.info({ userId: (req.user as { id: string })?.id }, "Listing all users");
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
    adminController.createRacer(req, res, next);
  });

/**
 * GET /api/admin/racers
 * List all racers (admin only)
 */
  adminRouter.get("/racers", adminLimiter, (req: Request, res: Response, next: NextFunction) => {
    req.log.info({ userId: (req.user as { id: string })?.id }, "Admin listing all racers");
    adminController.listRacers(req, res, next);
  });

/**
 * PUT /api/admin/racers/:racerId
 * Update a racer (admin only)
 */
  adminRouter.put(
    "/racers/:racerId",
    adminLimiter,
    (req: Request, res: Response, next: NextFunction) => {
      req.log.info(
        { adminId: (req.user as { id: string })?.id, racerId: req.params.racerId },
        "Admin updating racer",
      );
      adminController.updateRacer(req, res, next);
    },
  );

/**
 * DELETE /api/admin/racers/:racerId
 * Delete a racer (admin only)
 */
  adminRouter.delete(
    "/racers/:racerId",
    adminLimiter,
    (req: Request, res: Response, next: NextFunction) => {
      req.log.info(
        { adminId: (req.user as { id: string })?.id, racerId: req.params.racerId },
        "Admin deleting racer",
      );
      adminController.deleteRacer(req, res, next);
    },
  );

  return adminRouter;
}
