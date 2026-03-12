import { Request, Response, NextFunction, Router } from "express";
import { Container } from "../../Infrastructure/dependency-injection/container.js";
import { authMiddleware, requireRole } from "../../Infrastructure/http/middleware/index.js";
import { RacerController } from "./racer.controller.js";
import { validateRequestBody, validateParams } from "../../Infrastructure/validation/validateRequest.js";
import {
  createRacerSchema,
  updateRacerSchema,
  racerIdSchema,
} from "../../Infrastructure/validation/racer.schemas.js";

export interface CreateRacerRouterOptions {
  racerController?: RacerController;
}

export function createRacerRouter(options: CreateRacerRouterOptions = {}): Router {
  const router = Router();
  const racerController =
    options.racerController ?? Container.getInstance().createRacerController();

  router.get("/", (req: Request, res: Response, next: NextFunction) => {
    req.log.info("Fetching all racers");
    racerController.getAll(req, res, next);
  });

  router.get("/me", authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    req.log.info({ userId: (req.user as { id: string })?.id }, "Fetching racer for current user");
    racerController.getByUserId(req, res, next);
  });

  router.get(
    "/:id",
    validateParams(racerIdSchema),
    (req: Request, res: Response, next: NextFunction) => {
      req.log.info({ racerId: req.params.id }, "Fetching racer by ID");
      racerController.getById(req, res, next);
    },
  );

  router.post(
    "/",
    authMiddleware,
    requireRole("user", "contributor", "admin"),
    validateRequestBody(createRacerSchema),
    (req: Request, res: Response, next: NextFunction) => {
      req.log.info({ userId: (req.user as { id: string })?.id }, "Creating a new racer");
      racerController.create(req, res, next);
    },
  );

  router.put(
    "/:id",
    authMiddleware,
    requireRole("user", "contributor", "admin"),
    validateParams(racerIdSchema),
    validateRequestBody(updateRacerSchema),
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
    validateParams(racerIdSchema),
    (req: Request, res: Response, next: NextFunction) => {
      req.log.info(
        { userId: (req.user as { id: string })?.id, racerId: req.params.id },
        "Deleting racer",
      );
      racerController.delete(req, res, next);
    },
  );

  return router;
}
