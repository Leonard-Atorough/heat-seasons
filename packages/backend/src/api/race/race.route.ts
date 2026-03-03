import { authMiddleware, requireRole } from "src/Infrastructure/http/middleware";
import { Router } from "express";
import { Container } from "src/Infrastructure/dependency-injection/container";

const router = Router();

const raceController = Container.getInstance().createRaceController();

router.get("/", (req, res, next) => {
  raceController.getBySeasonId(req, res, next);
});

router.get("/:id", (req, res, next) => {
  raceController.getById(req, res, next);
});

router.post("/", authMiddleware, requireRole("contributor", "admin"), (req, res, next) => {
  raceController.create(req, res, next);
});

router.put("/:id", authMiddleware, requireRole("contributor", "admin"), (req, res, next) => {
  raceController.update(req, res, next);
});

router.delete("/:id", authMiddleware, requireRole("contributor", "admin"), (req, res, next) => {
  raceController.delete(req, res, next);
});

export { router as raceRouter };
