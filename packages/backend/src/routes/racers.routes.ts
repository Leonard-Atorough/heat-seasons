import { Router } from "express";

const router = Router();

// GET /api/racers
router.get("/", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// GET /api/racers/:id
router.get("/:id", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// POST /api/racers
router.post("/", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// PUT /api/racers/:id
router.put("/:id", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// DELETE /api/racers/:id
router.delete("/:id", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

export default router;
