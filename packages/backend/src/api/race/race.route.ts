import { Router } from "express";
import { Container } from "src/Infrastructure/dependency-injection/container";

const router = Router();
const raceController = Container.getInstance().createRaceController();

router.get("/", (req, res) => {
  raceController.getBySeasonId(req, res);
});

router.get("/:id", (req, res) => {
  raceController.getById(req, res);
});

router.post("/", (req, res) => {
  raceController.create(req, res);
});

router.put("/:id", (req, res) => {
  raceController.update(req, res);
});

router.delete("/:id", (req, res) => {
  raceController.delete(req, res);
});

export { router as raceRouter };
