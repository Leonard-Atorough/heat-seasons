import { BootstrapEntity } from "../entities/bootstrapEntity";

export interface IBootstrapRepository {
  getBootstrapConfig(): Promise<BootstrapEntity | null>;
  upsertBootstrapConfig(data: BootstrapEntity): Promise<BootstrapEntity>;
}
