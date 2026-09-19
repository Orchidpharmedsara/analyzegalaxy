-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceType" TEXT NOT NULL,
    "originalUrl" TEXT,
    "filePath" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "caption" TEXT,
    "hashtags" TEXT,
    "duration" REAL,
    "resolution" TEXT,
    "fps" REAL,
    "aspectRatio" TEXT,
    "fileSize" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "categoryScores" TEXT NOT NULL,
    "whatWorked" TEXT NOT NULL,
    "whyItCouldWorkOnSocial" TEXT NOT NULL,
    "narrativeCritique" TEXT NOT NULL,
    "improvementSuggestions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Analysis_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_videoId_key" ON "Analysis"("videoId");
