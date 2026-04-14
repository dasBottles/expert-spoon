import { describe, expect, it } from "vitest";

import {
  recipeCardSchema,
  spoonacularRecipeSchema,
  spoonacularResponseSchema,
  stripHtml,
  toRecipeCard,
} from "../lib/recipes";

const sampleRecipe = {
  id: 123,
  title: "Pasta Primavera",
  image: "https://img.spoonacular.com/recipes/123-312x231.jpg",
  readyInMinutes: 30,
  servings: 4,
  sourceUrl: "https://example.com/pasta",
  summary: "A <b>delicious</b> pasta dish with <a href='#'>fresh vegetables</a>.",
  instructions: "Boil water. Cook pasta.",
  extendedIngredients: [
    { id: 1, original: "200g penne pasta", name: "penne pasta", amount: 200, unit: "g" },
    { id: 2, original: "1 cup broccoli", name: "broccoli", amount: 1, unit: "cup" },
    { id: 3, original: "2 cloves garlic", name: "garlic", amount: 2, unit: "cloves" },
  ],
};

describe("recipes lib", () => {
  it("validates a spoonacular recipe", () => {
    const parsed = spoonacularRecipeSchema.parse(sampleRecipe);
    expect(parsed.title).toBe("Pasta Primavera");
    expect(parsed.extendedIngredients).toHaveLength(3);
  });

  it("validates a full spoonacular response", () => {
    const parsed = spoonacularResponseSchema.parse({ recipes: [sampleRecipe] });
    expect(parsed.recipes).toHaveLength(1);
  });

  it("transforms a spoonacular recipe to a card", () => {
    const parsed = spoonacularRecipeSchema.parse(sampleRecipe);
    const card = toRecipeCard(parsed);

    expect(card).toEqual({
      id: 123,
      title: "Pasta Primavera",
      image: "https://img.spoonacular.com/recipes/123-312x231.jpg",
      readyInMinutes: 30,
      servings: 4,
      sourceUrl: "https://example.com/pasta",
      summary: "A <b>delicious</b> pasta dish with <a href='#'>fresh vegetables</a>.",
      ingredientCount: 3,
      ingredients: ["200g penne pasta", "1 cup broccoli", "2 cloves garlic"],
    });

    expect(recipeCardSchema.parse(card)).toEqual(card);
  });

  it("handles recipes with missing optional fields", () => {
    const minimal = {
      id: 456,
      title: "Simple Salad",
      readyInMinutes: 10,
      servings: 2,
      summary: "A simple salad.",
      instructions: null,
      extendedIngredients: [],
    };

    const parsed = spoonacularRecipeSchema.parse(minimal);
    const card = toRecipeCard(parsed);

    expect(card.image).toBeUndefined();
    expect(card.sourceUrl).toBeUndefined();
    expect(card.ingredientCount).toBe(0);
    expect(card.ingredients).toEqual([]);
  });

  it("strips HTML tags from summaries", () => {
    expect(stripHtml("A <b>bold</b> statement")).toBe("A bold statement");
    expect(stripHtml("<p>Hello <a href='#'>world</a></p>")).toBe("Hello world");
    expect(stripHtml("No tags here")).toBe("No tags here");
    expect(stripHtml("")).toBe("");
  });

  it("rejects malformed spoonacular data", () => {
    const result = spoonacularResponseSchema.safeParse({ recipes: [{ id: "not-a-number" }] });
    expect(result.success).toBe(false);
  });
});
