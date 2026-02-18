import { Router } from "express";
import { Container } from "src/Infrastructure/dependency-injection/container";
import { authMiddleware } from "@src/middleware/authMiddleware";

const router = Router();
const protectedRouter = Router();
protectedRouter.use(authMiddleware);

const racerController = Container.getInstance().createRacerController();

router.get("/", (req, res) => {
  racerController.getAll(req, res);
});

router.get("/:id", (req, res) => {
  racerController.getById(req, res);
});

protectedRouter.post("/", (req, res) => {
  racerController.create(req, res);
});

protectedRouter.put("/:id", (req, res) => {
  racerController.update(req, res);
});

protectedRouter.delete("/:id", (req, res) => {
  racerController.delete(req, res);
});

export { router as racerRouter, protectedRouter as racerProtectedRouter };
