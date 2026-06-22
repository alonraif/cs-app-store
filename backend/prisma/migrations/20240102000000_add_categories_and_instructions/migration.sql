-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- AlterTable
ALTER TABLE "tools" ADD COLUMN "installationInstructions" TEXT;
ALTER TABLE "tools" ADD COLUMN "usageInstructions" TEXT;
