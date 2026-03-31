-- DropForeignKey
ALTER TABLE "dispatch_officer" DROP CONSTRAINT "dispatch_officer_dispatchId_fkey";

-- DropForeignKey
ALTER TABLE "dispatch_officer" DROP CONSTRAINT "dispatch_officer_officerId_fkey";

-- DropTable
DROP TABLE "dispatch_officer";

-- CreateTable
CREATE TABLE "dispatch_unit" (
    "id" SERIAL NOT NULL,
    "dispatchId" INTEGER NOT NULL,
    "callsign" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "dispatch_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatch_unit_officer" (
    "unitId" INTEGER NOT NULL,
    "officerId" INTEGER NOT NULL,

    CONSTRAINT "dispatch_unit_officer_pkey" PRIMARY KEY ("unitId","officerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "dispatch_unit_dispatchId_callsign_key" ON "dispatch_unit"("dispatchId", "callsign");

-- AddForeignKey
ALTER TABLE "dispatch_unit" ADD CONSTRAINT "dispatch_unit_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "dispatch_call"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch_unit_officer" ADD CONSTRAINT "dispatch_unit_officer_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "dispatch_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch_unit_officer" ADD CONSTRAINT "dispatch_unit_officer_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "officer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: add coords with a temporary default for existing rows, then remove default
ALTER TABLE "dispatch_call" ADD COLUMN "coords" TEXT NOT NULL DEFAULT '';
ALTER TABLE "dispatch_call" ALTER COLUMN "coords" DROP DEFAULT;
