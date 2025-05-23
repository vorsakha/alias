/*
  Warnings:

  - You are about to drop the column `email` on the `Creator` table. All the data in the column will be lost.
  - You are about to drop the column `facebookUsername` on the `Creator` table. All the data in the column will be lost.
  - You are about to drop the column `githubUsername` on the `Creator` table. All the data in the column will be lost.
  - You are about to drop the column `instagramUsername` on the `Creator` table. All the data in the column will be lost.
  - You are about to drop the column `lightningAddress` on the `Creator` table. All the data in the column will be lost.
  - You are about to drop the column `nostrPubkey` on the `Creator` table. All the data in the column will be lost.
  - You are about to drop the column `xUsername` on the `Creator` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Creator" DROP COLUMN "email",
DROP COLUMN "facebookUsername",
DROP COLUMN "githubUsername",
DROP COLUMN "instagramUsername",
DROP COLUMN "lightningAddress",
DROP COLUMN "nostrPubkey",
DROP COLUMN "xUsername";

-- CreateTable
CREATE TABLE "Socials" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "xUsername" TEXT,
    "instagramUsername" TEXT,
    "githubUsername" TEXT,
    "facebookUsername" TEXT,
    "email" TEXT,
    "nostrPubkey" TEXT,

    CONSTRAINT "Socials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallets" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "lightningAddress" TEXT,
    "bitcoinAddress" TEXT,
    "ethereumAddress" TEXT,
    "solanaAddress" TEXT,
    "dogeAddress" TEXT,
    "moneroAddress" TEXT,

    CONSTRAINT "Wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Socials_creatorId_key" ON "Socials"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallets_creatorId_key" ON "Wallets"("creatorId");

-- AddForeignKey
ALTER TABLE "Socials" ADD CONSTRAINT "Socials_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallets" ADD CONSTRAINT "Wallets_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
