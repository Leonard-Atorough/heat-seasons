import { Router } from "express";
import container from "../../containers/container";

const router = Router();
const racerController = container.createRacerController();

// GET /api/racers
router.get("/", (req, res) => {
  racerController.getAll(req, res);
});

// GET /api/racers/:id
router.get("/:id", (req, res) => {
  racerController.getById(req, res);
});

// POST /api/racers
router.post("/", (req, res) => {
  racerController.create(req, res);
});

// PUT /api/racers/:id
router.put("/:id", (req, res) => {
  racerController.update(req, res);
});

// DELETE /api/racers/:id
router.delete("/:id", (req, res) => {
  racerController.delete(req, res);
});

export { router as racerRouter };
