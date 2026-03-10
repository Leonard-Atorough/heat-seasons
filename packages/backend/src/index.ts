import { Application } from "express";
import { createApp } from "./app.js";
import { logger } from "./Infrastructure/logging/logger";
import { Container } from "./Infrastructure/dependency-injection/container.js";
import { PrismaStorageAdapter } from "./Infrastructure/persistence/PrismaStorageAdapter.js";

Container.configureDefaultStorageAdapter(() => new PrismaStorageAdapter());

const app: Application = createApp();
const PORT = process.env.PORT || 3001;

const container = Container.getInstance();
container.initializeStorageAdapter().catch((error) => {
  logger.error({ err: error }, "Failed to initialize storage adapter");
  process.exit(1);
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Heat Seasons API server running");
});

export default app;
