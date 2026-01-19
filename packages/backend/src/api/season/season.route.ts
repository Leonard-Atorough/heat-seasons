import { Router } from "express";
import { getContainerInstance } from "../../containers/container";

const router = Router();
const seasonController = getContainerInstance().createSeasonController();

router.get("/", (req, res) => {
  seasonController.getAll(req, res);
});

router.get("/:id", (req, res) => {
  seasonController.getById(req, res);
});

router.get("/current/active", (req, res) => {
  seasonController.getCurrent(req, res);
});

router.post("/", (req, res) => {
  seasonController.create(req, res);
});

router.put("/:id", (req, res) => {
  seasonController.update(req, res);
});

router.delete("/:id", (req, res) => {
  seasonController.delete(req, res);
});

export { router as seasonRouter };
