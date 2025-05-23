-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('LIGHTNING', 'BITCOIN', 'ETHEREUM', 'SOLANA', 'DOGE', 'MONERO');

-- AlterTable
ALTER TABLE "Wallets" ADD COLUMN     "mainWallet" "WalletType" DEFAULT 'LIGHTNING';
