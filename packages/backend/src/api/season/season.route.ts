import { Router } from "express";
import container from "../../containers/container";

const router = Router();
const seasonController = container.createSeasonController();

// GET /api/seasons
router.get("/", (req, res) => {
  seasonController.getAll(req, res);
});

// GET /api/seasons/:id
router.get("/:id", (req, res) => {
  seasonController.getById(req, res);
});

// POST /api/seasons
router.post("/", (req, res) => {
  seasonController.create(req, res);
});

// PUT /api/seasons/:id
router.put("/:id", (req, res) => {
  seasonController.update(req, res);
});

// DELETE /api/seasons/:id
router.delete("/:id", (req, res) => {
  seasonController.delete(req, res);
});

export { router as seasonRouter };
