import { Router } from "express";

const router = Router();

// GET /api/seasons/:seasonId/races
router.get("/", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// GET /api/races/:id
router.get("/:id", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// POST /api/seasons/:seasonId/races
router.post("/", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// PUT /api/races/:id
router.put("/:id", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// DELETE /api/races/:id
router.delete("/:id", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

export default router;
