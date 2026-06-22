-- CreateEnum
CREATE TYPE "ToolType" AS ENUM ('cli', 'desktop', 'webapp');

-- CreateTable
CREATE TABLE "tools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "type" "ToolType" NOT NULL,
    "version" TEXT,
    "owner" TEXT NOT NULL,
    "ownerContact" TEXT NOT NULL,
    "screenshots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "installCommand" TEXT,
    "repoUrl" TEXT,
    "downloadUrl" TEXT,
    "launchUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);
