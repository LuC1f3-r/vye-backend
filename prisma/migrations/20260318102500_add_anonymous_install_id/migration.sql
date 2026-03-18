-- AlterTable
ALTER TABLE "User" ADD COLUMN     "anonymous_install_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_anonymous_install_id_key" ON "User"("anonymous_install_id");
