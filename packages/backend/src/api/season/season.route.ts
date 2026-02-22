import { Router } from "express";
import { Container } from "../../Infrastructure/dependency-injection/container";
import { authMiddleware, requireRole } from "src/Infrastructure/http/middleware";

const router = Router();
const seasonController = Container.getInstance().createSeasonController();

router.get("/", (req, res, next) => {
  seasonController.getAll(req, res, next);
});

router.get("/active", (req, res, next) => {
  seasonController.getCurrent(req, res, next);
});

router.get("/:id", (req, res, next) => {
  seasonController.getById(req, res, next);
});

router.post("/",authMiddleware, requireRole("admin"), (req, res, next) => {
  seasonController.create(req, res, next);
});

router.put("/:id",authMiddleware, requireRole("admin"), (req, res, next) => {
  seasonController.update(req, res, next);
});

router.delete("/:id",authMiddleware, requireRole("admin"), (req, res, next) => {
  seasonController.delete(req, res, next);
});

export { router as seasonRouter };
