import { Request, Response, NextFunction, Router } from "express";
import { Container } from "../../Infrastructure/dependency-injection/container.js";
import { authMiddleware, requireRole } from "src/Infrastructure/http/middleware";
import { SeasonController } from "./season.controller.js";

export interface CreateSeasonRouterOptions {
  seasonController?: SeasonController;
}

export function createSeasonRouter(options: CreateSeasonRouterOptions = {}): Router {
  const router = Router();
  const seasonController =
    options.seasonController ?? Container.getInstance().createSeasonController();

  router.get("/", (req: Request, res: Response, next: NextFunction) => {
    req.log.info("Fetching all seasons");
    seasonController.getAll(req, res, next);
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

  router.get(
    "/:id/participants",
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      req.log.info({ seasonId: req.params.id }, "Fetching season participants");
      seasonController.getParticipants(req, res, next);
    },
  );

  router.post(
    "/:id/join/:racerId",
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      req.log.info(
        {
          userId: (req.user as { id: string })?.id,
          seasonId: req.params.id,
          racerId: req.params.racerId,
        },
        "Joining season",
      );
      seasonController.join(req, res, next);
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

  return router;
}
