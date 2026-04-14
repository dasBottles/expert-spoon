import { NextResponse } from "next/server";

import { spoonacularResponseSchema, toRecipeCard, stripHtml } from "../../../lib/recipes";

export async function GET(request: Request) {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Spoonacular API key is not configured." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const number = Math.min(Math.max(Number(searchParams.get("number") ?? "6"), 1), 20);
  const tags = searchParams.get("tags") ?? "";

  const url = new URL("https://api.spoonacular.com/recipes/random");
  url.searchParams.set("number", String(number));
  url.searchParams.set("apiKey", apiKey);
  if (tags) {
    url.searchParams.set("include-tags", tags);
  }

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch recipes from Spoonacular." },
        { status: response.status },
      );
    }

    const data = spoonacularResponseSchema.parse(await response.json());
    const cards = data.recipes.map((recipe) => ({
      ...toRecipeCard(recipe),
      summary: stripHtml(recipe.summary),
    }));

    return NextResponse.json(cards);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch recipes." },
      { status: 500 },
    );
  }
}
