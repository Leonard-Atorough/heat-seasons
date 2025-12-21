import { Router } from "express";
import container from "../../containers/container";

const router = Router();
const raceController = container.createRaceController();

// GET /api/seasons/:seasonId/races
router.get("/", (req, res) => {
  raceController.getBySeasonId(req, res);
});

// GET /api/races/:id
router.get("/:id", (req, res) => {
  raceController.getById(req, res);
});

// POST /api/seasons/:seasonId/races
router.post("/", (req, res) => {
  raceController.create(req, res);
});

// PUT /api/races/:id
router.put("/:id", (req, res) => {
  raceController.update(req, res);
});

// DELETE /api/races/:id
router.delete("/:id", (req, res) => {
  raceController.delete(req, res);
});

export { router as raceRouter };
