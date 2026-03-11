import {
  CreateBootstrapConfig,
  BootstrapConfigResponse,
  CreateBootstrapAdminUserInput,
  UserResponse,
} from "src/application/dtos";
import { IBootstrapService } from "./bootstrap.service.interface";
import { IAuthRepository, IBootstrapRepository } from "src/domain/repositories";
import { BootstrapEntity, UserEntity } from "src/domain/entities";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { UserMapper } from "src/application/mappers";
import { ConflictError, NotFoundError, ValidationError } from "src/domain/errors";
import { wrapWriteOperation } from "src/api/serviceWriteFailure";

export class BootstrapService implements IBootstrapService {
  constructor(
    private bootstrapRepository: IBootstrapRepository,
    private authRepository: IAuthRepository,
  ) {}

  async isSystemBootstrapped(): Promise<boolean> {
    const config = await this.bootstrapRepository.getBootstrapConfig();

    return config?.isInitialized ?? false;
  }
  async generateBootstrapToken(
    config: CreateBootstrapConfig = { expirationMinutes: 60 },
  ): Promise<BootstrapConfigResponse> {
    if (await this.isSystemBootstrapped()) {
      throw new ConflictError("System is already bootstrapped", {
        resource: "bootstrapConfig",
      });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + config.expirationMinutes * 60 * 1000);

    const bootstrapEntity = BootstrapEntity.create({
      bootstrapTokenHash: tokenHash,
      bootstrapTokenExpiresAt: expiresAt,
      isInitialized: false,
    });

    const bootstrapToken = await wrapWriteOperation(
      () => this.bootstrapRepository.upsertBootstrapConfig(bootstrapEntity),
      "Failed to generate bootstrap token",
      { operation: "generateBootstrapToken" },
    );

    return {
      bootstrapToken: token,
      expiresAt,
    } as BootstrapConfigResponse;
  }
  async bootstrapSystem(data: CreateBootstrapAdminUserInput): Promise<UserResponse> {
    const config = await this.bootstrapRepository.getBootstrapConfig();

    if (!config) {
      throw new NotFoundError(
        "Bootstrap configuration not found. Please generate a bootstrap token first.",
        { resource: "bootstrapConfig" },
      );
    }
    if (config.isInitialized) {
      throw new ConflictError("System is already bootstrapped", { resource: "bootstrapConfig" });
    }
    if (config.bootstrapTokenExpiresAt < new Date()) {
      throw new ValidationError("Bootstrap token has expired. Please generate a new one.", {
        reason: "tokenExpired",
      });
    }
    if (!bcrypt.compareSync(data.token, config.bootstrapTokenHash)) {
      throw new ValidationError("Invalid bootstrap token", { reason: "tokenInvalid" });
    }

    // Create the admin user
    const adminUser = UserEntity.create({
      name: data.name,
      email: data.email,
      role: "admin",
      profilePicture: "",
      googleId: data.googleId,
      racerId: undefined,
    });
    const createdAdmin = await wrapWriteOperation(
      () => this.authRepository.create(adminUser),
      "Failed to create bootstrap admin",
      { operation: "createBootstrapAdmin", email: data.email },
    );

    // Update bootstrap config to mark system as initialized
    config.isInitialized = true;
    await wrapWriteOperation(
      () => this.bootstrapRepository.upsertBootstrapConfig(config),
      "Failed to finalize bootstrap",
      { operation: "finalizeBootstrap" },
    );

    return UserMapper.toResponse(createdAdmin);
  }
}
