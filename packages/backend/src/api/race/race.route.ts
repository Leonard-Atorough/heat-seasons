import { authMiddleware, requireRole } from "../../Infrastructure/http/middleware/index.js";
import { Request, Response, NextFunction, Router } from "express";
import { Container } from "../../Infrastructure/dependency-injection/container.js";
import { RaceController } from "./race.controller.js";

export interface CreateRaceRouterOptions {
  raceController?: RaceController;
}

export function createRaceRouter(options: CreateRaceRouterOptions = {}): Router {
  const router = Router();
  const raceController = options.raceController ?? Container.getInstance().createRaceController();

  router.get("/", (req: Request, res: Response, next: NextFunction) => {
    req.log.info("Fetching all races");
    raceController.getBySeasonId(req, res, next);
  });

  router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
    raceController.getById(req, res, next);
  });

  router.post(
    "/",
    authMiddleware,
    requireRole("contributor", "admin"),
    (req: Request, res: Response, next: NextFunction) => {
      req.log.info({ userId: (req.user as { id: string })?.id }, "Creating a new race");
      raceController.create(req, res, next);
    },
  );

  router.put(
    "/:id",
    authMiddleware,
    requireRole("contributor", "admin"),
    (req: Request, res: Response, next: NextFunction) => {
      req.log.info(
        { userId: (req.user as { id: string })?.id, raceId: req.params.id },
        "Updating race",
      );
      raceController.update(req, res, next);
    },
  );

  router.delete(
    "/:id",
    authMiddleware,
    requireRole("contributor", "admin"),
    (req: Request, res: Response, next: NextFunction) => {
      req.log.info(
        { userId: (req.user as { id: string })?.id, raceId: req.params.id },
        "Deleting race",
      );
      raceController.delete(req, res, next);
    },
  );

  return router;
}
