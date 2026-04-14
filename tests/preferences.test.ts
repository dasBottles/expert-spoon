import { describe, expect, it } from "vitest";

import {
  difficultyOptions,
  dietaryRestrictionOptions,
  cuisineOptions,
  defaultPreferences,
  preferencesFormSchema,
  toApiPayload,
} from "../lib/preferences";

describe("preferences helpers", () => {
  it("exposes the six onboarding question option groups and default values", () => {
    expect(dietaryRestrictionOptions).toContain("vegetarian");
    expect(cuisineOptions).toContain("Mediterranean");
    expect(difficultyOptions).toEqual(["easy", "medium", "hard"]);
    expect(defaultPreferences).toEqual({
      dietaryRestrictions: [],
      allergies: "",
      cuisines: [],
      prepTimeMax: 30,
      difficultyMax: "medium",
      excludeIngredients: "",
    });
  });

  it("normalizes free-text list fields and shapes the API payload", () => {
    const parsed = preferencesFormSchema.parse({
      dietaryRestrictions: ["vegetarian", "gluten-free"],
      allergies: "peanuts, shellfish\n tree nuts",
      cuisines: ["Italian", "Asian"],
      prepTimeMax: 45,
      difficultyMax: "easy",
      excludeIngredients: "mushrooms, olives",
    });

    expect(toApiPayload(parsed)).toEqual({
      dietary_restrictions: ["vegetarian", "gluten-free"],
      allergies: ["peanuts", "shellfish", "tree nuts"],
      cuisines: ["Italian", "Asian"],
      prep_time_max: 45,
      difficulty_max: "easy",
      exclude_ingredients: ["mushrooms", "olives"],
    });
  });

  it("rejects invalid difficulty values", () => {
    const result = preferencesFormSchema.safeParse({
      ...defaultPreferences,
      difficultyMax: "expert",
    });

    expect(result.success).toBe(false);
  });
});
