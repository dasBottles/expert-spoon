PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "dietType" JSONB NOT NULL,
    "allergies" JSONB NOT NULL,
    "cookingSkill" TEXT NOT NULL,
    "householdSize" INTEGER NOT NULL,
    "timePreference" INTEGER NOT NULL,
    "cuisinePreferences" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_UserPreferences" ("id", "dietType", "allergies", "cookingSkill", "householdSize", "timePreference", "cuisinePreferences", "createdAt", "updatedAt")
SELECT "id", "dietaryRestrictions", "allergies", "difficultyMax", 2, "prepTimeMax", "cuisines", "createdAt", "updatedAt"
FROM "UserPreferences";
DROP TABLE "UserPreferences";
ALTER TABLE "new_UserPreferences" RENAME TO "UserPreferences";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
