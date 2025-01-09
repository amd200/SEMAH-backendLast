-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "whatsappTokenExpiration" TIMESTAMP(3),
ADD COLUMN     "whatsappVerificationToken" TEXT;
