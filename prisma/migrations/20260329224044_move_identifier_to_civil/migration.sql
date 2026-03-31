/*
  Warnings:

  - You are about to drop the column `identifier` on the `officer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[identifier]` on the table `civil` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "officer_identifier_key";

-- AlterTable
ALTER TABLE "civil" ADD COLUMN     "identifier" TEXT;

-- AlterTable
ALTER TABLE "officer" DROP COLUMN "identifier";

-- CreateIndex
CREATE UNIQUE INDEX "civil_identifier_key" ON "civil"("identifier");
