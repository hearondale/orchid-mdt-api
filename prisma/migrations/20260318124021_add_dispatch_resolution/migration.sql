-- AlterTable
ALTER TABLE "dispatch_call" ADD COLUMN "resolvedAt" TIMESTAMP(3),
ADD COLUMN "resolvedByCallsign" TEXT;
