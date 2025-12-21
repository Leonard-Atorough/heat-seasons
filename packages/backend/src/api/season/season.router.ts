import { Router } from "express";

const router = Router();

// GET /api/seasons
router.get("/", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// GET /api/seasons/:id
router.get("/:id", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// POST /api/seasons
router.post("/", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// PUT /api/seasons/:id
router.put("/:id", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

// DELETE /api/seasons/:id
router.delete("/:id", (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

export { router as seasonRouter };
