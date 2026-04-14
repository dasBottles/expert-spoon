-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "dietaryRestrictions" JSONB NOT NULL,
    "allergies" JSONB NOT NULL,
    "cuisines" JSONB NOT NULL,
    "prepTimeMax" INTEGER NOT NULL,
    "difficultyMax" TEXT NOT NULL,
    "excludeIngredients" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
