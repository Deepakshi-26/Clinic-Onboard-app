-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "middleName" TEXT;

-- AlterTable
ALTER TABLE "AccessCredential" ADD COLUMN     "medexaLink" TEXT,
ADD COLUMN     "medexaUsername" TEXT,
ADD COLUMN     "myleLink" TEXT,
ADD COLUMN     "myleUsername" TEXT;

-- Backfill firstName/lastName for existing employees by splitting fullName
-- on the first space. Best-effort only — anyone with a single-word name
-- gets it as firstName with lastName left blank; HR can fix these up
-- individually on the New Hire Info screen.
UPDATE "Employee"
SET
  "firstName" = split_part("fullName", ' ', 1),
  "lastName" = CASE
    WHEN position(' ' in "fullName") > 0
    THEN substring("fullName" from position(' ' in "fullName") + 1)
    ELSE ''
  END
WHERE "firstName" = '' AND "lastName" = '';

