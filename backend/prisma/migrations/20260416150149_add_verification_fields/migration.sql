-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email_verify_token" TEXT,
ADD COLUMN     "phone_otp" TEXT,
ADD COLUMN     "phone_otp_expiry" TIMESTAMP(3);
