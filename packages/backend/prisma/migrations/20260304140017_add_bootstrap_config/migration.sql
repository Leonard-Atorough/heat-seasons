-- CreateTable
CREATE TABLE "BootstrapConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "bootstrapTokenHash" TEXT NOT NULL,
    "bootstrapTokenExpiry" DATETIME NOT NULL,
    "isBootstrapped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
