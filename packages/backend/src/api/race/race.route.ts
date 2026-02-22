import { authMiddleware, requireRole } from "src/Infrastructure/http/middleware";
import { Router } from "express";
import { Container } from "src/Infrastructure/dependency-injection/container";

const router = Router();

const raceController = Container.getInstance().createRaceController();

router.get("/", (req, res) => {
  raceController.getBySeasonId(req, res);
});

router.get("/:id", (req, res) => {
  console.log("Received request for race with ID:", req.params.id);
  raceController.getById(req, res);
});

router.post("/", authMiddleware, requireRole("contributor", "admin"), (req, res) => {
  raceController.create(req, res);
});

router.put("/:id", authMiddleware, requireRole("contributor", "admin"), (req, res) => {
  raceController.update(req, res);
});

router.delete("/:id", authMiddleware, requireRole("contributor", "admin"), (req, res) => {
  raceController.delete(req, res);
});

export { router as raceRouter };
