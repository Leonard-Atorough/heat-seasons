import { Router } from "express";
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
adminRouter.get("/users", adminLimiter, (req, res) => {
  const adminController = Container.getInstance().createAdminController();
  adminController.listUsers(req, res);
});

/**
 * POST /api/admin/promote
 * Promote a user to contributor role
 *
 * Body: { userId: string }
 */
adminRouter.post("/promote", adminLimiter, (req, res) => {
  const adminController = Container.getInstance().createAdminController();
  adminController.promoteUser(req, res);
});

/**
 * POST /api/admin/demote
 * Demote a contributor user to regular user role
 *
 * Body: { userId: string }
 */
adminRouter.post("/demote", adminLimiter, (req, res) => {
  const adminController = Container.getInstance().createAdminController();
  adminController.demoteUser(req, res);
});

export { adminRouter };
