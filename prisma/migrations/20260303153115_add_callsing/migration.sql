/*
  Warnings:

  - Added the required column `callsign` to the `officer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "officer" ADD COLUMN     "callsign" TEXT NOT NULL;
