-- Rename Civil.name -> firstName, Civil.surname -> lastName
ALTER TABLE "civil" RENAME COLUMN "name" TO "firstName";
ALTER TABLE "civil" RENAME COLUMN "surname" TO "lastName";
