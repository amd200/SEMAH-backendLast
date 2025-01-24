-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "_ConsultationToEmployee" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ConsultationToEmployee_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ConsultationToEmployee_B_index" ON "_ConsultationToEmployee"("B");

-- AddForeignKey
ALTER TABLE "_ConsultationToEmployee" ADD CONSTRAINT "_ConsultationToEmployee_A_fkey" FOREIGN KEY ("A") REFERENCES "Consultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConsultationToEmployee" ADD CONSTRAINT "_ConsultationToEmployee_B_fkey" FOREIGN KEY ("B") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
