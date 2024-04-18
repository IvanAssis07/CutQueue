/*
  Warnings:

  - You are about to drop the column `workDays` on the `OpeningHours` table. All the data in the column will be lost.
  - Added the required column `day` to the `OpeningHours` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OpeningHours" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day" INTEGER NOT NULL,
    "openingTime" TEXT NOT NULL,
    "closingTime" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    CONSTRAINT "OpeningHours_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OpeningHours" ("barbershopId", "closingTime", "id", "openingTime") SELECT "barbershopId", "closingTime", "id", "openingTime" FROM "OpeningHours";
DROP TABLE "OpeningHours";
ALTER TABLE "new_OpeningHours" RENAME TO "OpeningHours";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
