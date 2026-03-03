import { Request, Response, NextFunction, Router } from "express";
import { Container } from "../../Infrastructure/dependency-injection/container";
import { authMiddleware, requireRole } from "src/Infrastructure/http/middleware";

const router = Router();
const seasonController = Container.getInstance().createSeasonController();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  req.log.info("Fetching all seasons");
  seasonController.getAll(req, res, next);
});

router.get("/active", (req: Request, res: Response, next: NextFunction) => {
  req.log.info("Fetching active season");
  seasonController.getCurrent(req, res, next);
});

router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  req.log.info({ seasonId: req.params.id }, "Fetching season by ID");
  seasonController.getById(req, res, next);
});

router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  (req: Request, res: Response, next: NextFunction) => {
    req.log.info({ userId: (req.user as { id: string })?.id }, "Creating a new season");
    seasonController.create(req, res, next);
  },
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  (req: Request, res: Response, next: NextFunction) => {
    req.log.info(
      { userId: (req.user as { id: string })?.id, seasonId: req.params.id },
      "Updating season",
    );
    seasonController.update(req, res, next);
  },
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  (req: Request, res: Response, next: NextFunction) => {
    req.log.info(
      { userId: (req.user as { id: string })?.id, seasonId: req.params.id },
      "Deleting season",
    );
    seasonController.delete(req, res, next);
  },
);

export { router as seasonRouter };
