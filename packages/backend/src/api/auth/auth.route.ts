import { Router } from "express";
import passport from "passport";
import { getContainerInstance } from "../../containers/container";

const router = Router();
const authController = getContainerInstance().createAuthController();

router.get("/me", (req, res) => {
  authController.getMe(req, res);
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    authController.googleCallback(req, res);
  },
);

router.post("/logout", (req, res) => {
  authController.logout(req, res);
});

router.post("/login", (req, res) => {
  authController.login(req, res);
});

router.post("/register", (req, res) => {
  authController.register(req, res);
});

router.post("/refresh", (req, res) => {
  authController.refresh(req, res);
});

export { router as authRouter };
