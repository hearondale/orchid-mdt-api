-- CreateEnum
CREATE TYPE "DepartmentType" AS ENUM ('LSPD', 'LSSD', 'FIRE', 'EMS', 'SAHP', 'FIB', 'DISPATCH');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'VACATION');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'CLOSED', 'COLD');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('PHYSICAL', 'DIGITAL', 'TESTIMONIAL', 'WEAPON', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "BoloType" AS ENUM ('PERSON', 'VEHICLE', 'WEAPON');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('PENDING', 'ASSIGNED', 'ENROUTE', 'ONSCENE', 'CLOSED');

-- CreateEnum
CREATE TYPE "OrderItemType" AS ENUM ('WEAPON', 'EQUIPMENT', 'VEHICLE');

-- CreateTable
CREATE TABLE "civil" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "licenses" TEXT[],

    CONSTRAINT "civil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DepartmentType" NOT NULL,
    "access" TEXT[],

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "officer" (
    "id" SERIAL NOT NULL,
    "civilId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "identifier" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "permissions" TEXT[],

    CONSTRAINT "officer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle" (
    "id" SERIAL NOT NULL,
    "plate" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "stolen" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" INTEGER,

    CONSTRAINT "vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weapon" (
    "id" SERIAL NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "weaponType" TEXT NOT NULL,
    "registered" BOOLEAN NOT NULL DEFAULT false,
    "stolen" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "ownerId" INTEGER,

    CONSTRAINT "weapon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penal_code" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fineAmount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "penal_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arrest_report" (
    "id" SERIAL NOT NULL,
    "suspectId" INTEGER NOT NULL,
    "processingOfficerId" INTEGER NOT NULL,
    "penalCodeIds" INTEGER[],
    "bailAmount" INTEGER NOT NULL DEFAULT 0,
    "sentenceMinutes" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arrest_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bolo" (
    "id" SERIAL NOT NULL,
    "issuedById" INTEGER NOT NULL,
    "targetType" "BoloType" NOT NULL,
    "targetIdentifier" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "bolo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "collectedById" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_officer" (
    "incidentId" INTEGER NOT NULL,
    "officerId" INTEGER NOT NULL,

    CONSTRAINT "incident_officer_pkey" PRIMARY KEY ("incidentId","officerId")
);

-- CreateTable
CREATE TABLE "incident_suspect" (
    "incidentId" INTEGER NOT NULL,
    "civilId" INTEGER NOT NULL,

    CONSTRAINT "incident_suspect_pkey" PRIMARY KEY ("incidentId","civilId")
);

-- CreateTable
CREATE TABLE "incident_arrest" (
    "incidentId" INTEGER NOT NULL,
    "arrestId" INTEGER NOT NULL,

    CONSTRAINT "incident_arrest_pkey" PRIMARY KEY ("incidentId","arrestId")
);

-- CreateTable
CREATE TABLE "incident_bolo" (
    "incidentId" INTEGER NOT NULL,
    "boloId" INTEGER NOT NULL,

    CONSTRAINT "incident_bolo_pkey" PRIMARY KEY ("incidentId","boloId")
);

-- CreateTable
CREATE TABLE "dispatch_call" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispatch_call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatch_officer" (
    "dispatchId" INTEGER NOT NULL,
    "officerId" INTEGER NOT NULL,

    CONSTRAINT "dispatch_officer_pkey" PRIMARY KEY ("dispatchId","officerId")
);

-- CreateTable
CREATE TABLE "orderable_item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrderItemType" NOT NULL,
    "spawncode" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "orderable_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orderable_item_department" (
    "itemId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,

    CONSTRAINT "orderable_item_department_pkey" PRIMARY KEY ("itemId","departmentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "officer_civilId_key" ON "officer"("civilId");

-- CreateIndex
CREATE UNIQUE INDEX "officer_identifier_key" ON "officer"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "officer_badge_key" ON "officer"("badge");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_plate_key" ON "vehicle"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_vin_key" ON "vehicle"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "weapon_serialNumber_key" ON "weapon"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "penal_code_code_key" ON "penal_code"("code");

-- AddForeignKey
ALTER TABLE "officer" ADD CONSTRAINT "officer_civilId_fkey" FOREIGN KEY ("civilId") REFERENCES "civil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "officer" ADD CONSTRAINT "officer_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "civil"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weapon" ADD CONSTRAINT "weapon_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "civil"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arrest_report" ADD CONSTRAINT "arrest_report_suspectId_fkey" FOREIGN KEY ("suspectId") REFERENCES "civil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arrest_report" ADD CONSTRAINT "arrest_report_processingOfficerId_fkey" FOREIGN KEY ("processingOfficerId") REFERENCES "officer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bolo" ADD CONSTRAINT "bolo_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "officer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident" ADD CONSTRAINT "incident_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES "officer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_officer" ADD CONSTRAINT "incident_officer_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_officer" ADD CONSTRAINT "incident_officer_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "officer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_suspect" ADD CONSTRAINT "incident_suspect_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_suspect" ADD CONSTRAINT "incident_suspect_civilId_fkey" FOREIGN KEY ("civilId") REFERENCES "civil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_arrest" ADD CONSTRAINT "incident_arrest_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_arrest" ADD CONSTRAINT "incident_arrest_arrestId_fkey" FOREIGN KEY ("arrestId") REFERENCES "arrest_report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_bolo" ADD CONSTRAINT "incident_bolo_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_bolo" ADD CONSTRAINT "incident_bolo_boloId_fkey" FOREIGN KEY ("boloId") REFERENCES "bolo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch_officer" ADD CONSTRAINT "dispatch_officer_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "dispatch_call"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch_officer" ADD CONSTRAINT "dispatch_officer_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "officer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderable_item_department" ADD CONSTRAINT "orderable_item_department_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "orderable_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderable_item_department" ADD CONSTRAINT "orderable_item_department_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
