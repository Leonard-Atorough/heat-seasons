import { BootstrapEntity } from "../entities/BootstrapEntity";

export interface IBootstrapRepository {
  getBootstrapConfig(): Promise<BootstrapEntity | null>;
  upsertBootstrapConfig(data: BootstrapEntity): Promise<BootstrapEntity>;
}
