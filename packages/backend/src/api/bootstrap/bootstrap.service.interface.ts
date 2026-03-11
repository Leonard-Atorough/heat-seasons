import {
  BootstrapConfigResponse,
  CreateBootstrapAdminUserInput,
  CreateBootstrapConfig,
  UserResponse,
} from "../../application/dtos/index.js";

export interface IBootstrapService {
  isSystemBootstrapped(): Promise<boolean>;
  generateBootstrapToken(config?: CreateBootstrapConfig): Promise<BootstrapConfigResponse>;
  bootstrapSystem(data: CreateBootstrapAdminUserInput): Promise<UserResponse>;
}
