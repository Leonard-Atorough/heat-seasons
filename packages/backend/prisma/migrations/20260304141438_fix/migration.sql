/*
  Warnings:

  - You are about to drop the column `bootstrapTokenExpiry` on the `BootstrapConfig` table. All the data in the column will be lost.
  - You are about to drop the column `isBootstrapped` on the `BootstrapConfig` table. All the data in the column will be lost.
  - Added the required column `bootstrapTokenExpiresAt` to the `BootstrapConfig` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BootstrapConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "bootstrapTokenHash" TEXT NOT NULL,
    "bootstrapTokenExpiresAt" DATETIME NOT NULL,
    "isInitialized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BootstrapConfig" ("bootstrapTokenHash", "createdAt", "id", "updatedAt") SELECT "bootstrapTokenHash", "createdAt", "id", "updatedAt" FROM "BootstrapConfig";
DROP TABLE "BootstrapConfig";
ALTER TABLE "new_BootstrapConfig" RENAME TO "BootstrapConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
