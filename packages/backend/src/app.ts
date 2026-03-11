import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./Infrastructure/security/passport.js";
import { COOKIE_DOMAIN, COOKIE_SECURE, FRONTEND_URL, SESSION_SECRET } from "./env.js";
import { requestLogger } from "./Infrastructure/logging/requestLogger.js";
import { handleError } from "./Infrastructure/http/middleware/index.js";
import { Container } from "./Infrastructure/dependency-injection/container.js";
import { createAuthRouter, AuthController } from "./api/auth/index.js";
import { AdminController, createAdminRouter } from "./api/admin/index.js";
import { createRacerRouter, RacerController } from "./api/racer/index.js";
import { createSeasonRouter, SeasonController } from "./api/season/index.js";
import { createRaceRouter, RaceController } from "./api/race/index.js";
import { BootstrapController, createBootstrapRouter } from "./api/bootstrap/index.js";

export interface AppControllers {
  authController: AuthController;
  adminController: AdminController;
  racerController: RacerController;
  raceController: RaceController;
  seasonController: SeasonController;
  bootstrapController: BootstrapController;
}

type ControllerFactory = Pick<
  Container,
  | "createAuthController"
  | "createAdminController"
  | "createRacerController"
  | "createRaceController"
  | "createSeasonController"
  | "createBootstrapController"
>;

export interface CreateAppOptions {
  controllers?: Partial<AppControllers>;
  controllerFactory?: ControllerFactory;
}

function buildControllers(options?: CreateAppOptions): AppControllers {
  const controllerFactory = options?.controllerFactory ?? Container.getInstance();

  return {
    authController:
      options?.controllers?.authController ?? controllerFactory.createAuthController(),
    adminController:
      options?.controllers?.adminController ?? controllerFactory.createAdminController(),
    racerController:
      options?.controllers?.racerController ?? controllerFactory.createRacerController(),
    raceController:
      options?.controllers?.raceController ?? controllerFactory.createRaceController(),
    seasonController:
      options?.controllers?.seasonController ?? controllerFactory.createSeasonController(),
    bootstrapController:
      options?.controllers?.bootstrapController ?? controllerFactory.createBootstrapController(),
  };
}

export function createApp(options?: CreateAppOptions): Application {
  const controllers = buildControllers(options);
  const app: Application = express();

  app.use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      optionsSuccessStatus: 200,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(requestLogger);

  app.use(
    session({
      secret: SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: COOKIE_SECURE,
        httpOnly: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", message: "Heat Seasons API is running" });
  });

  app.use("/api/auth", createAuthRouter({ authController: controllers.authController }));
  app.use("/api/admin", createAdminRouter({ adminController: controllers.adminController }));
  app.use("/api/racers", createRacerRouter({ racerController: controllers.racerController }));
  app.use("/api/seasons", createSeasonRouter({ seasonController: controllers.seasonController }));
  app.use("/api/races", createRaceRouter({ raceController: controllers.raceController }));
  app.use(
    "/api/bootstrap",
    createBootstrapRouter({ bootstrapController: controllers.bootstrapController }),
  );

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    handleError(err, req, res, next);
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: "Route not found",
      code: "NOT_FOUND",
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
