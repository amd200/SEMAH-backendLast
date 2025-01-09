-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "whatsappTokenExpiration" TIMESTAMP(3),
ADD COLUMN     "whatsappVerificationToken" TEXT;
