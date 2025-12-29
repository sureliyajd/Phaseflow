-- AlterTable
-- First, add columns as nullable (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'name') THEN
    ALTER TABLE "User" ADD COLUMN "name" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'bio') THEN
    ALTER TABLE "User" ADD COLUMN "bio" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'timezone') THEN
    ALTER TABLE "User" ADD COLUMN "timezone" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'avatarUrl') THEN
    ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
  END IF;
END $$;

-- Set default name for existing users (use email prefix)
UPDATE "User" SET "name" = SPLIT_PART("email", '@', 1) WHERE "name" IS NULL;

-- Now make name required
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
