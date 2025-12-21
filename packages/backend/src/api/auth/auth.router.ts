import { Router } from "express";
import container from "../../containers/container";

const router = Router();
const authController = container.createAuthController();

// POST /api/auth/register
router.post("/register", (req, res) => {
  authController.register(req, res);
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  authController.login(req, res);
});

// POST /api/auth/refresh
router.post("/refresh", (req, res) => {
  authController.refresh(req, res);
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  authController.logout(req, res);
});

export { router as authRouter };
