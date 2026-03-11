/*
  Warnings:

  - The primary key for the `RaceResult` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `RaceResult` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RaceResult" (
    "raceId" TEXT NOT NULL,
    "racerId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "constructorPoints" INTEGER NOT NULL,
    "isGhostRacer" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("raceId", "racerId"),
    CONSTRAINT "RaceResult_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RaceResult_racerId_fkey" FOREIGN KEY ("racerId") REFERENCES "Racer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RaceResult" ("constructorPoints", "isGhostRacer", "points", "position", "raceId", "racerId") SELECT "constructorPoints", "isGhostRacer", "points", "position", "raceId", "racerId" FROM "RaceResult";
DROP TABLE "RaceResult";
ALTER TABLE "new_RaceResult" RENAME TO "RaceResult";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
