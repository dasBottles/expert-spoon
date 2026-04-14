import { z } from "zod";

export const dietaryRestrictionOptions = [
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

export const difficultyOptions = ["easy", "medium", "hard"] as const;
export const prepTimeOptions = [15, 30, 45, 60] as const;

const dietaryRestrictionEnum = z.enum(dietaryRestrictionOptions);
const cuisineEnum = z.enum(cuisineOptions);
const difficultyEnum = z.enum(difficultyOptions);

type DietaryRestriction = z.infer<typeof dietaryRestrictionEnum>;
type Cuisine = z.infer<typeof cuisineEnum>;
type Difficulty = z.infer<typeof difficultyEnum>;

export const defaultPreferences = {
  dietaryRestrictions: [] as DietaryRestriction[],
  allergies: "",
  cuisines: [] as Cuisine[],
  prepTimeMax: 30,
  difficultyMax: "medium" as Difficulty,
  excludeIngredients: "",
};

export const preferencesFormSchema = z.object({
  dietaryRestrictions: z.array(dietaryRestrictionEnum).default([]),
  allergies: z.string().trim().default(""),
  cuisines: z.array(cuisineEnum).default([]),
  prepTimeMax: z.coerce.number().refine((value) => prepTimeOptions.includes(value as 15 | 30 | 45 | 60), {
    message: "Choose a supported prep time.",
  }),
  difficultyMax: difficultyEnum,
  excludeIngredients: z.string().trim().default(""),
});

export const preferencesApiSchema = z.object({
  dietary_restrictions: z.array(dietaryRestrictionEnum).default([]),
  allergies: z.array(z.string()).default([]),
  cuisines: z.array(cuisineEnum).default([]),
  prep_time_max: z.coerce.number().refine((value) => prepTimeOptions.includes(value as 15 | 30 | 45 | 60), {
    message: "Choose a supported prep time.",
  }),
  difficulty_max: difficultyEnum,
  exclude_ingredients: z.array(z.string()).default([]),
});

export type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;
export type PreferencesApiPayload = z.infer<typeof preferencesApiSchema>;

export function splitList(value: string): string[] {
  return [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];
}

export function joinList(values: string[]): string {
  return values.join(", ");
}

export function toApiPayload(values: PreferencesFormValues): PreferencesApiPayload {
  return {
    dietary_restrictions: values.dietaryRestrictions,
    allergies: splitList(values.allergies),
    cuisines: values.cuisines,
    prep_time_max: values.prepTimeMax,
    difficulty_max: values.difficultyMax,
    exclude_ingredients: splitList(values.excludeIngredients),
  };
}

export function fromApiPayload(payload: PreferencesApiPayload): PreferencesFormValues {
  return {
    dietaryRestrictions: payload.dietary_restrictions,
    allergies: joinList(payload.allergies),
    cuisines: payload.cuisines,
    prepTimeMax: payload.prep_time_max,
    difficultyMax: payload.difficulty_max,
    excludeIngredients: joinList(payload.exclude_ingredients),
  };
}

export function emptyApiPayload(): PreferencesApiPayload {
  return {
    dietary_restrictions: [],
    allergies: [],
    cuisines: [],
    prep_time_max: defaultPreferences.prepTimeMax,
    difficulty_max: defaultPreferences.difficultyMax,
    exclude_ingredients: [],
  };
}
