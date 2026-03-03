import { Request, Response, NextFunction, Router } from "express";
import { Container } from "src/Infrastructure/dependency-injection/container";
import { authMiddleware, requireRole } from "src/Infrastructure/http/middleware";

const router = Router();

const racerController = Container.getInstance().createRacerController();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  req.log.info("Fetching all racers");
  racerController.getAll(req, res, next);
});

router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  req.log.info({ racerId: req.params.id }, "Fetching racer by ID");
  racerController.getById(req, res, next);
});

router.post(
  "/",
  authMiddleware,
  requireRole("user", "contributor", "admin"),
  (req: Request, res: Response, next: NextFunction) => {
    req.log.info({ userId: (req.user as { id: string })?.id }, "Creating a new racer");
    racerController.create(req, res, next);
  },
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("user", "contributor", "admin"),
  (req: Request, res: Response, next: NextFunction) => {
    req.log.info(
      { userId: (req.user as { id: string })?.id, racerId: req.params.id },
      "Updating racer",
    );
    racerController.update(req, res, next);
  },
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("user", "contributor", "admin"),
  (req: Request, res: Response, next: NextFunction) => {
    req.log.info(
      { userId: (req.user as { id: string })?.id, racerId: req.params.id },
      "Deleting racer",
    );
    racerController.delete(req, res, next);
  },
);

export { router as racerRouter };
