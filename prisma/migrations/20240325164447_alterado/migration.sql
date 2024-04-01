/*
  Warnings:

  - You are about to drop the `OpenningHours` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OpenningHours";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "OpeningHours" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workDays" INTEGER NOT NULL,
    "openingTime" DATETIME NOT NULL,
    "closingTime" DATETIME NOT NULL,
    "barbershopId" TEXT NOT NULL,
    CONSTRAINT "OpeningHours_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "OpeningHours_barbershopId_key" ON "OpeningHours"("barbershopId");
