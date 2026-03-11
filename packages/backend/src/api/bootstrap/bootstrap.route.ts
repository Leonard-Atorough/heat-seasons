import { Container } from "src/Infrastructure/dependency-injection/container";
import { Request, Response, NextFunction, Router } from "express";
import { BootstrapController } from "./bootstrap.controller.js";

export interface CreateBootstrapRouterOptions {
  bootstrapController?: BootstrapController;
}

export function createBootstrapRouter(options: CreateBootstrapRouterOptions = {}): Router {
  const router = Router();
  const bootstrapController =
    options.bootstrapController ?? Container.getInstance().createBootstrapController();

  router.post("/token", async (req: Request, res: Response, next: NextFunction) => {
    req.log.info("Generating bootstrap token");
    bootstrapController.generateBootstrapToken(req, res, next);
  });

  router.post("/admin", async (req: Request, res: Response, next: NextFunction) => {
    req.log.info("Bootstrapping system with admin user");
    bootstrapController.bootstrapSystem(req, res, next);
  });

  router.get("/status", async (req: Request, res: Response, next: NextFunction) => {
    req.log.info("Checking if system is bootstrapped");
    bootstrapController.isSystemBootstrapped(req, res, next);
  });

  return router;
}
