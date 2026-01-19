import { Router } from "express";
import { getContainerInstance } from "../../containers/container";

const router = Router();
const racerController = getContainerInstance().createRacerController();

router.get("/", (req, res) => {
  racerController.getAll(req, res);
});

router.get("/:id", (req, res) => {
  racerController.getById(req, res);
});

router.post("/", (req, res) => {
  racerController.create(req, res);
});

router.put("/:id", (req, res) => {
  racerController.update(req, res);
});

router.delete("/:id", (req, res) => {
  racerController.delete(req, res);
});

export { router as racerRouter };
