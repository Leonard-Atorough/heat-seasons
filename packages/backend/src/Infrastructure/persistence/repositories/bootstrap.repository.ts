import { BootstrapEntity } from "src/domain/entities";
import { IBootstrapRepository } from "src/domain/repositories";
import { StorageAdapter } from "../StorageAdapter";
import { BootstrapMapper } from "src/application/mappers";

export class BootstrapRepository implements IBootstrapRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  async getBootstrapConfig(): Promise<BootstrapEntity | null> {
    const config = await this.storageAdapter.findById<BootstrapEntity>(
      "bootstrapConfig",
      "singleton",
    );
    if (!config) return null;
    return BootstrapMapper.toDomainFromPersistence(config);
  }
  async upsertBootstrapConfig(data: BootstrapEntity): Promise<BootstrapEntity> {
    if (data.id) {
      // Update existing config
      const updated = await this.storageAdapter.update(
        "bootstrapConfig",
        data.id,
        BootstrapMapper.toPersistence(data),
      );
      return BootstrapMapper.toDomainFromPersistence(updated);
    }

    const dataToSave = {
      ...BootstrapMapper.toPersistence(data),
      // we will set the id as "singleton" since we only expect one config object. This simplifies retrieval and updates.
      id: "singleton",
    };
    const saved = await this.storageAdapter.create("bootstrapConfig", dataToSave);
    return BootstrapMapper.toDomainFromPersistence(saved);
  }
}
