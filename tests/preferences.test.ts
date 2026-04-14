import { describe, expect, it } from "vitest";

import {
  cookingSkillOptions,
  cuisineOptions,
  defaultPreferences,
  dietTypeOptions,
  householdSizeOptions,
  preferencesFormSchema,
  toApiPayload,
} from "../lib/preferences";

describe("preferences helpers", () => {
  it("exposes the six onboarding question option groups and default values", () => {
    expect(dietTypeOptions).toContain("vegetarian");
    expect(cuisineOptions).toContain("Mediterranean");
    expect(cookingSkillOptions).toEqual(["easy", "medium", "hard"]);
    expect(householdSizeOptions).toEqual([1, 2, 4, 6]);
    expect(defaultPreferences).toEqual({
      dietType: [],
      allergies: "",
      cookingSkill: "medium",
      householdSize: 2,
      timePreference: 30,
      cuisinePreferences: [],
    });
  });

  it("normalizes free-text list fields and shapes the API payload", () => {
    const parsed = preferencesFormSchema.parse({
      dietType: ["vegetarian", "gluten-free"],
      allergies: "peanuts, shellfish\n tree nuts",
      cookingSkill: "easy",
      householdSize: 4,
      timePreference: 45,
      cuisinePreferences: ["Italian", "Asian"],
    });

    expect(toApiPayload(parsed)).toEqual({
      diet_type: ["vegetarian", "gluten-free"],
      allergies: ["peanuts", "shellfish", "tree nuts"],
      cooking_skill: "easy",
      household_size: 4,
      time_preference: 45,
      cuisine_preferences: ["Italian", "Asian"],
    });
  });

  it("rejects invalid cooking skill values", () => {
    const result = preferencesFormSchema.safeParse({
      ...defaultPreferences,
      cookingSkill: "expert",
    });

    expect(result.success).toBe(false);
  });
});
