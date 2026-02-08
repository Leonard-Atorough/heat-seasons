import { Router } from "express";
import passport from "passport";
import { Container } from "../../containers/container";

const router = Router();
const authController = Container.getInstance().createAuthController();

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

export { router as authRouter };
