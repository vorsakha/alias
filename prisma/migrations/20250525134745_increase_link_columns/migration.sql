-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "album" TEXT,
ADD COLUMN     "artist" TEXT,
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "author" TEXT,
ADD COLUMN     "canonical" TEXT,
ADD COLUMN     "genre" TEXT,
ADD COLUMN     "imageHeight" INTEGER,
ADD COLUMN     "imageWidth" INTEGER,
ADD COLUMN     "modifiedTime" TEXT,
ADD COLUMN     "publishedTime" TEXT,
ADD COLUMN     "releaseDate" TEXT,
ADD COLUMN     "siteName" TEXT,
ADD COLUMN     "themeColor" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'link',
ADD COLUMN     "videoUrl" TEXT;

-- CreateIndex
CREATE INDEX "Link_creatorId_type_idx" ON "Link"("creatorId", "type");

-- CreateIndex
CREATE INDEX "Link_siteName_idx" ON "Link"("siteName");
