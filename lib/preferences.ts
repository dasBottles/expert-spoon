import { z } from "zod";

export const dietTypeOptions = [
  "vegetarian",
  "vegan",
  "keto",
  "paleo",
  "gluten-free",
  "dairy-free",
] as const;

export const cuisineOptions = [
  "Italian",
  "Asian",
  "Mexican",
  "American",
  "Mediterranean",
  "Indian",
] as const;

export const cookingSkillOptions = ["easy", "medium", "hard"] as const;
export const timePreferenceOptions = [15, 30, 45, 60] as const;
export const householdSizeOptions = [1, 2, 4, 6] as const;

const dietTypeEnum = z.enum(dietTypeOptions);
const cuisineEnum = z.enum(cuisineOptions);
const cookingSkillEnum = z.enum(cookingSkillOptions);

type DietType = z.infer<typeof dietTypeEnum>;
type Cuisine = z.infer<typeof cuisineEnum>;
type CookingSkill = z.infer<typeof cookingSkillEnum>;

export const defaultPreferences = {
  dietType: [] as DietType[],
  allergies: "",
  cookingSkill: "medium" as CookingSkill,
  householdSize: 2,
  timePreference: 30,
  cuisinePreferences: [] as Cuisine[],
};

export const preferencesFormSchema = z.object({
  dietType: z.array(dietTypeEnum),
  allergies: z.string().trim(),
  cookingSkill: cookingSkillEnum,
  householdSize: z.coerce
    .number()
    .int()
    .refine((value) => householdSizeOptions.includes(value as 1 | 2 | 4 | 6), {
      message: "Choose a supported household size.",
    }),
  timePreference: z.coerce
    .number()
    .refine((value) => timePreferenceOptions.includes(value as 15 | 30 | 45 | 60), {
      message: "Choose a supported prep time.",
    }),
  cuisinePreferences: z.array(cuisineEnum),
});

export const preferencesApiSchema = z
  .object({
    diet_type: z.array(dietTypeEnum),
    allergies: z.array(z.string().trim().min(1)),
    cooking_skill: cookingSkillEnum,
    household_size: z.coerce
      .number()
      .int()
      .refine((value) => householdSizeOptions.includes(value as 1 | 2 | 4 | 6), {
        message: "Choose a supported household size.",
      }),
    time_preference: z.coerce
      .number()
      .refine((value) => timePreferenceOptions.includes(value as 15 | 30 | 45 | 60), {
        message: "Choose a supported prep time.",
      }),
    cuisine_preferences: z.array(cuisineEnum),
  })
  .strict();

export type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;
export type PreferencesApiPayload = z.infer<typeof preferencesApiSchema>;

export function splitList(value: string): string[] {
  return [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];
}

export function joinList(values: string[]): string {
  return values.join(", ");
}

export function toApiPayload(values: PreferencesFormValues): PreferencesApiPayload {
  const parsedValues = preferencesFormSchema.parse(values);

  return {
    diet_type: parsedValues.dietType,
    allergies: splitList(parsedValues.allergies),
    cooking_skill: parsedValues.cookingSkill,
    household_size: parsedValues.householdSize,
    time_preference: parsedValues.timePreference,
    cuisine_preferences: parsedValues.cuisinePreferences,
  };
}

export function fromApiPayload(payload: PreferencesApiPayload): PreferencesFormValues {
  return {
    dietType: payload.diet_type,
    allergies: joinList(payload.allergies),
    cookingSkill: payload.cooking_skill,
    householdSize: payload.household_size,
    timePreference: payload.time_preference,
    cuisinePreferences: payload.cuisine_preferences,
  };
}

export function emptyApiPayload(): PreferencesApiPayload {
  return {
    diet_type: [],
    allergies: [],
    cooking_skill: defaultPreferences.cookingSkill,
    household_size: defaultPreferences.householdSize,
    time_preference: defaultPreferences.timePreference,
    cuisine_preferences: [],
  };
}
