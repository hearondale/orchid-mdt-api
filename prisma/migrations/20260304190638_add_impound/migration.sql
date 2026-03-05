-- CreateTable
CREATE TABLE "impounds" (
    "id" SERIAL NOT NULL,
    "plate" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "ownerName" TEXT,
    "reason" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedById" INTEGER NOT NULL,

    CONSTRAINT "impounds_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "impounds" ADD CONSTRAINT "impounds_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "officer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
