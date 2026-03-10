-- Add leadOfficerId to incident table
ALTER TABLE "incident" ADD COLUMN "leadOfficerId" INTEGER;
ALTER TABLE "incident" ADD CONSTRAINT "incident_leadOfficerId_fkey" FOREIGN KEY ("leadOfficerId") REFERENCES "officer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
