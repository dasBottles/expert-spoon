import { z } from "zod";

export const spoonacularIngredientSchema = z.object({
  id: z.number(),
  original: z.string(),
  name: z.string(),
  amount: z.number(),
  unit: z.string(),
});

export const spoonacularRecipeSchema = z.object({
  id: z.number(),
  title: z.string(),
  image: z.string().optional(),
  readyInMinutes: z.number(),
  servings: z.number(),
  sourceUrl: z.string().optional(),
  summary: z.string(),
  instructions: z.string().nullable().optional(),
  extendedIngredients: z.array(spoonacularIngredientSchema),
});

export const spoonacularResponseSchema = z.object({
  recipes: z.array(spoonacularRecipeSchema),
});

export const recipeCardSchema = z.object({
  id: z.number(),
  title: z.string(),
  image: z.string().optional(),
  readyInMinutes: z.number(),
  servings: z.number(),
  sourceUrl: z.string().optional(),
  summary: z.string(),
  ingredientCount: z.number(),
  ingredients: z.array(z.string()),
});

export const recipeCardsSchema = z.array(recipeCardSchema);

export type SpoonacularRecipe = z.infer<typeof spoonacularRecipeSchema>;
export type RecipeCard = z.infer<typeof recipeCardSchema>;

export function toRecipeCard(recipe: SpoonacularRecipe): RecipeCard {
  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    readyInMinutes: recipe.readyInMinutes,
    servings: recipe.servings,
    sourceUrl: recipe.sourceUrl,
    summary: recipe.summary,
    ingredientCount: recipe.extendedIngredients.length,
    ingredients: recipe.extendedIngredients.map((i) => i.original),
  };
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
