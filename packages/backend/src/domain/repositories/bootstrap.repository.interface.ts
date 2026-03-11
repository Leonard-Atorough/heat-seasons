import { BootstrapEntity } from "../entities/index.js";

export interface IBootstrapRepository {
  getBootstrapConfig(): Promise<BootstrapEntity | null>;
  upsertBootstrapConfig(data: BootstrapEntity): Promise<BootstrapEntity>;
}
