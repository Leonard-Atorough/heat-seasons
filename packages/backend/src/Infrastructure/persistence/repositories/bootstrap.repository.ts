import { BootstrapEntity } from "@src/domain/entities";
import { IBootstrapRepository } from "src/domain/repositories";
import { StorageAdapter } from "../StorageAdapter";
import { BootstrapMapper } from "@src/application/mappers";

export class BootstrapRepository implements IBootstrapRepository {
  constructor(private storageAdapter: StorageAdapter) {}
  async getBootstrapConfig(): Promise<BootstrapEntity | null> {
    const config = await this.storageAdapter.findById<BootstrapEntity>(
      "bootstrapConfig",
      "singleton",
    );
    return BootstrapMapper.toDomainFromPersistence(config) ?? null;
  }
  async upsertBootstrapConfig(data: BootstrapEntity): Promise<BootstrapEntity> {
    const dataToSave = {
      ...BootstrapMapper.toPersistence(data),
      // we will set the id as "singleton" since we only expect one config object. This simplifies retrieval and updates.
      id: "singleton",
    };
    const saved = await this.storageAdapter.create("bootstrapConfig", dataToSave);
    return BootstrapMapper.toDomainFromPersistence(saved);
  }
}
