import { BootstrapEntity } from "../entities";

export interface IBootstrapRepository {
  getBootstrapConfig(): Promise<BootstrapEntity | null>;
  upsertBootstrapConfig(data: BootstrapEntity): Promise<BootstrapEntity>;
}
