import type { StorageAdapter } from "../persistence/StorageAdapter.js";
import { ServiceLocator } from "./serviceLocator.js";
import {
  AuthRepository,
  RacerRepository,
  RaceRepository,
  SeasonRepository,
  BootstrapRepository,
} from "../persistence/repositories";
import {
  IAuthRepository,
  IBootstrapRepository,
  IRaceRepository,
  IRacerRepository,
  ISeasonRepository,
} from "src/domain/repositories";
import { AuthController } from "src/api/auth/auth.controller";
import { AuthService } from "src/api/auth/auth.service";
import { IAuthService } from "src/api/auth/auth.service.interface";
import { AdminController } from "src/api/admin/admin.controller";
import { RacerController } from "src/api/racer/racer.controller";
import { RacerService } from "src/api/racer/racer.service";
import { IRacerService } from "src/api/racer/racer.service.interface";
import { RaceController } from "src/api/race/race.controller";
import { RaceService } from "src/api/race/race.service";
import { IRaceService } from "src/api/race/race.service.interface";
import { SeasonController } from "src/api/season/season.controller";
import { SeasonService } from "src/api/season/season.service";
import { ISeasonService } from "src/api/season/season.service.interface";
import { BootstrapController } from "src/api/bootstrap/bootstrap.controller";
import { BootstrapService } from "src/api/bootstrap/bootstrap.service";
import { IBootstrapService } from "src/api/bootstrap/bootstrap.service.interface";

type RepositoryName =
  | "AuthRepository"
  | "RacerRepository"
  | "RaceRepository"
  | "SeasonRepository"
  | "BootstrapRepository";

type ServiceName =
  | "AuthService"
  | "RacerService"
  | "RaceService"
  | "SeasonService"
  | "BootstrapService";

export interface ContainerOptions {
  storageAdapter?: StorageAdapter;
  serviceLocator?: ServiceLocator;
}

class Container {
  private static instance: Container | null = null;
  private static defaultStorageAdapterFactory: (() => StorageAdapter) | null = null;
  private readonly storageAdapter: StorageAdapter;
  private readonly repositories = new Map<RepositoryName, unknown>();
  private readonly serviceLocator: ServiceLocator;

  private constructor(options: ContainerOptions = {}) {
    this.storageAdapter = options.storageAdapter ?? Container.createDefaultStorageAdapter();
    this.serviceLocator = options.serviceLocator ?? new ServiceLocator();
    this.registerDefaultServices();
  }

  public static configureDefaultStorageAdapter(factory: () => StorageAdapter): void {
    Container.defaultStorageAdapterFactory = factory;
  }

  public static create(options: ContainerOptions = {}): Container {
    return new Container(options);
  }

  public static setInstance(container: Container): void {
    Container.instance = container;
  }

  public static resetInstance(): void {
    Container.instance = null;
  }

  private static createDefaultStorageAdapter(): StorageAdapter {
    if (!Container.defaultStorageAdapterFactory) {
      throw new Error(
        "Default storage adapter is not configured. " +
          "Call Container.configureDefaultStorageAdapter() before using Container.getInstance().",
      );
    }

    return Container.defaultStorageAdapterFactory();
  }

  private registerDefaultServices(): void {
    this.serviceLocator.clear();

    const authService = new AuthService(this.getRepository<IAuthRepository>("AuthRepository"));
    this.registerService("AuthService", authService);

    const racerService = new RacerService(
      this.getRepository<IRacerRepository>("RacerRepository"),
      this.getRepository<IAuthRepository>("AuthRepository"),
    );
    this.registerService("RacerService", racerService);

    const raceService = new RaceService(
      this.getRepository<IRaceRepository>("RaceRepository"),
      this.getRepository<ISeasonRepository>("SeasonRepository"),
    );
    this.registerService("RaceService", raceService);

    const seasonService = new SeasonService(
      this.getRepository<ISeasonRepository>("SeasonRepository"),
    );
    this.registerService("SeasonService", seasonService);

    const bootstrapService = new BootstrapService(
      this.getRepository<IBootstrapRepository>("BootstrapRepository"),
      this.getRepository<IAuthRepository>("AuthRepository"),
    );
    this.registerService("BootstrapService", bootstrapService);
  }

  public static getInstance(): Container {
    if (Container.instance === null) {
      Container.instance = new Container();
    }

    return Container.instance;
  }

  public async initializeStorageAdapter(): Promise<void> {
    await this.storageAdapter.initialize();
  }

  /**
   * Registers a service in the service locator. This allows us to access the service from anywhere in the application without needing to pass it through constructors or function parameters.
   *
   * @param name - The name of the service
   * @param service - The class or interface of the service
   */
  public registerService<T>(name: ServiceName, service: T): void {
    this.serviceLocator.register(name, service);
  }

  public getStorageAdapter(): StorageAdapter {
    return this.storageAdapter;
  }

  public getAuthService(): IAuthService {
    return this.getService<IAuthService>("AuthService");
  }

  public getRacerService(): IRacerService {
    return this.getService<IRacerService>("RacerService");
  }

  public getRaceService(): IRaceService {
    return this.getService<IRaceService>("RaceService");
  }

  public getSeasonService(): ISeasonService {
    return this.getService<ISeasonService>("SeasonService");
  }

  public getBootstrapService(): IBootstrapService {
    return this.getService<IBootstrapService>("BootstrapService");
  }

  createAuthController(): AuthController {
    return new AuthController(this.getAuthService());
  }

  createRacerController(): RacerController {
    return new RacerController(this.getRacerService());
  }

  createRaceController(): RaceController {
    return new RaceController(this.getRaceService());
  }

  createSeasonController(): SeasonController {
    return new SeasonController(this.getSeasonService());
  }

  createAdminController(): AdminController {
    return new AdminController(this.getAuthService(), this.getRacerService());
  }

  createBootstrapController(): BootstrapController {
    return new BootstrapController(this.getBootstrapService());
  }

  private getService<T>(name: ServiceName): T {
    return this.serviceLocator.get<T>(name);
  }

  private createRepository<T>(name: RepositoryName): T {
    switch (name) {
      case "AuthRepository":
        return new AuthRepository(this.storageAdapter) as unknown as T;
      case "RacerRepository":
        return new RacerRepository(this.storageAdapter) as unknown as T;
      case "RaceRepository":
        return new RaceRepository(this.storageAdapter) as unknown as T;
      case "SeasonRepository":
        return new SeasonRepository(this.storageAdapter) as unknown as T;
      case "BootstrapRepository":
        return new BootstrapRepository(this.storageAdapter) as unknown as T;
      default:
        throw new Error(`Repository ${name} not found`);
    }
  }

  private getRepository<T>(name: RepositoryName): T {
    if (!this.repositories.has(name)) {
      this.repositories.set(name, this.createRepository<T>(name));
    }
    return this.repositories.get(name) as T;
  }

  public getRepositoryInstance<T>(name: RepositoryName): T {
    return this.getRepository<T>(name);
  }
}

export { Container };
