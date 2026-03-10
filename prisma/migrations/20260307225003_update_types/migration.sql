/*
  Warnings:

  - The values [OPEN] on the enum `IncidentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IncidentStatus_new" AS ENUM ('ONGOING', 'CLOSED', 'COLD');
ALTER TABLE "public"."incident" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "incident" ALTER COLUMN "status" TYPE "IncidentStatus_new" USING ("status"::text::"IncidentStatus_new");
ALTER TYPE "IncidentStatus" RENAME TO "IncidentStatus_old";
ALTER TYPE "IncidentStatus_new" RENAME TO "IncidentStatus";
DROP TYPE "public"."IncidentStatus_old";
ALTER TABLE "incident" ALTER COLUMN "status" SET DEFAULT 'ONGOING';
COMMIT;

-- AlterTable
ALTER TABLE "incident" ALTER COLUMN "status" SET DEFAULT 'ONGOING';
