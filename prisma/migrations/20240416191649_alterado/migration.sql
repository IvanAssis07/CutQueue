-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OpeningHours" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workDays" INTEGER NOT NULL,
    "openingTime" TEXT NOT NULL,
    "closingTime" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    CONSTRAINT "OpeningHours_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OpeningHours" ("barbershopId", "closingTime", "id", "openingTime", "workDays") SELECT "barbershopId", "closingTime", "id", "openingTime", "workDays" FROM "OpeningHours";
DROP TABLE "OpeningHours";
ALTER TABLE "new_OpeningHours" RENAME TO "OpeningHours";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
