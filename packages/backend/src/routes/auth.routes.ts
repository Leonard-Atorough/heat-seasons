import { Router } from "express";

const router = Router();

// POST /api/auth/register
router.post("/register", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// POST /api/auth/refresh
router.post("/refresh", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

export default router;
