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
      // TODO: Replace with a custom error class from the domain layer, will be mapped to http error in the infrastructure layer
      throw new Error("System is already bootstrapped");
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + config.expirationMinutes * 60 * 1000);

    const bootstrapEntity = BootstrapEntity.create({
      bootstrapTokenHash: tokenHash,
      bootstrapTokenExpiresAt: expiresAt,
      isInitialized: false,
    });

    const bootstrapToken = await this.bootstrapRepository.upsertBootstrapConfig(bootstrapEntity);

    return {
      bootstrapToken: token,
      expiresAt,
    } as BootstrapConfigResponse;
  }
  async bootstrapSystem(data: CreateBootstrapAdminUserInput): Promise<UserResponse> {
    const config = await this.bootstrapRepository.getBootstrapConfig();

    if (!config) {
      throw new Error(
        "Bootstrap configuration not found. Please generate a bootstrap token first.",
      );
    }
    if (config.isInitialized) {
      throw new Error("System is already bootstrapped");
    }
    if (config.bootstrapTokenExpiresAt < new Date()) {
      throw new Error("Bootstrap token has expired. Please generate a new one.");
    }
    if (!bcrypt.compareSync(data.token, config.bootstrapTokenHash)) {
      throw new Error("Invalid bootstrap token");
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
    const createdAdmin = await this.authRepository.create(adminUser);

    // Update bootstrap config to mark system as initialized
    config.isInitialized = true;
    await this.bootstrapRepository.upsertBootstrapConfig(config);

    return UserMapper.toResponse(createdAdmin);
  }
}
