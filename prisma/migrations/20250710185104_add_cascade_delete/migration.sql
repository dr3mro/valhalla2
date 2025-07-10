-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Auth" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cratedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Auth" ("cratedAt", "email", "id", "password", "updatedAt", "userId") SELECT "cratedAt", "email", "id", "password", "updatedAt", "userId" FROM "Auth";
DROP TABLE "Auth";
ALTER TABLE "new_Auth" RENAME TO "Auth";
CREATE UNIQUE INDEX "Auth_email_key" ON "Auth"("email");
CREATE UNIQUE INDEX "Auth_userId_key" ON "Auth"("userId");
CREATE TABLE "new_PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PasswordResetToken" ("createdAt", "expiresAt", "id", "token", "userId") SELECT "createdAt", "expiresAt", "id", "token", "userId" FROM "PasswordResetToken";
DROP TABLE "PasswordResetToken";
ALTER TABLE "new_PasswordResetToken" RENAME TO "PasswordResetToken";
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
