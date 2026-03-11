import { BootstrapEntity } from "src/domain/entities";
import { IBootstrapRepository } from "src/domain/repositories";
import { StorageAdapter } from "../StorageAdapter.js";
import { BootstrapMapper } from "src/application/mappers";
import { wrapWriteFailure } from "./repositoryWriteFailure.js";

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
      try {
        const updated = await this.storageAdapter.update(
          "bootstrapConfig",
          data.id,
          BootstrapMapper.toPersistence(data),
        );
        return BootstrapMapper.toDomainFromPersistence(updated);
      } catch (error) {
        throw wrapWriteFailure(
          "Failed to update bootstrap config",
          { operation: "updateBootstrapConfig", configId: data.id },
          error,
        );
      }
    }

    const dataToSave = {
      ...BootstrapMapper.toPersistence(data),
      // we will set the id as "singleton" since we only expect one config object. This simplifies retrieval and updates.
      id: "singleton",
    };
    try {
      const saved = await this.storageAdapter.create("bootstrapConfig", dataToSave);
      return BootstrapMapper.toDomainFromPersistence(saved);
    } catch (error) {
      throw wrapWriteFailure(
        "Failed to create bootstrap config",
        { operation: "createBootstrapConfig" },
        error,
      );
    }
  }
}
