-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentDirectory" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "frontmatter" TEXT NOT NULL,
    "timestamp" DATETIME,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published" BOOLEAN NOT NULL,
    "requiresUpdate" BOOLEAN DEFAULT false,
    "description" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Content" ("code", "contentDirectory", "description", "frontmatter", "id", "published", "requiresUpdate", "slug", "timestamp", "title", "updatedAt") SELECT "code", "contentDirectory", "description", "frontmatter", "id", "published", "requiresUpdate", "slug", "timestamp", "title", "updatedAt" FROM "Content";
DROP TABLE "Content";
ALTER TABLE "new_Content" RENAME TO "Content";
CREATE UNIQUE INDEX "Content_slug_key" ON "Content"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
