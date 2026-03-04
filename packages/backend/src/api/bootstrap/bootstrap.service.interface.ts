import {
  BootstrapConfigResponse,
  CreateBootstrapAdminUserInput,
  CreateBootstrapConfig,
  UserResponse,
} from "src/application/dtos";

export interface IBootstrapService {
  isSystemBootstrapped(): Promise<boolean>;
  generateBootstrapToken(config: CreateBootstrapConfig): Promise<BootstrapConfigResponse>;
  bootstrapSystem(data: CreateBootstrapAdminUserInput): Promise<UserResponse>;
}
