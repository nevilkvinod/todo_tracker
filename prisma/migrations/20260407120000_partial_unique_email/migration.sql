-- Drop the standard unique index
DROP INDEX IF EXISTS "User_email_key";

-- Create partial unique index
CREATE UNIQUE INDEX "User_email_key" ON "User"("email") WHERE "deletedAt" IS NULL;
