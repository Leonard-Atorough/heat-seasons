import { Router } from "express";
import { Container } from "src/Infrastructure/dependency-injection/container";
import { authMiddleware, requireRole } from "src/Infrastructure/http/middleware";

const router = Router();

const racerController = Container.getInstance().createRacerController();

router.get("/", (req, res) => {
  racerController.getAll(req, res);
});

router.get("/:id", (req, res) => {
  racerController.getById(req, res);
});

router.post("/", authMiddleware, requireRole("user", "contributor", "admin"), (req, res) => {
  racerController.create(req, res);
});

router.put("/:id", authMiddleware, requireRole("user", "contributor", "admin"), (req, res) => {
  racerController.update(req, res);
});

router.delete("/:id", authMiddleware, requireRole("user", "contributor", "admin"), (req, res) => {
  racerController.delete(req, res);
});

export { router as racerRouter };
