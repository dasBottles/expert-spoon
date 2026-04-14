"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { recipeCardsSchema, type RecipeCard } from "../lib/recipes";
import { dietTypeOptions } from "../lib/preferences";

export function RecipeExplorer() {
  const [recipes, setRecipes] = useState<RecipeCard[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const preferencesLoaded = useRef(false);

  const fetchRecipes = useCallback(async (tags: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ number: "6" });
      if (tags.length > 0) {
        params.set("tags", tags.join(","));
      }
      const response = await fetch(`/api/recipes?${params.toString()}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch recipes.");
      }
      const data = recipeCardsSchema.parse(await response.json());
      setRecipes(data);
    } catch {
      setError("Could not load recipes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      let tags: string[] = [];
      try {
        const response = await fetch("/api/preferences", { cache: "no-store" });
        if (response.ok) {
          const prefs = await response.json();
          if (Array.isArray(prefs.diet_type) && prefs.diet_type.length > 0) {
            tags = prefs.diet_type;
            setSelectedTags(tags);
          }
        }
      } catch {
        // Preferences are optional
      }
      preferencesLoaded.current = true;
      await fetchRecipes(tags);
    }

    void init();
  }, [fetchRecipes]);

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    );
  }

  function handleShuffle() {
    void fetchRecipes(selectedTags);
  }

  function truncate(text: string, max: number): string {
    if (text.length <= max) return text;
    return text.slice(0, max).trimEnd() + "...";
  }

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12 sm:px-10">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Recipes
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
              Discover dinner ideas
            </h1>
            <p className="max-w-2xl text-base leading-7 text-zinc-600">
              Random recipes based on your dietary preferences. Toggle filters and shuffle for new
              ideas.
            </p>
          </div>
          <button
            type="button"
            onClick={handleShuffle}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {isLoading ? "Loading..." : "Shuffle recipes"}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {dietTypeOptions.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-4 py-2 text-sm font-medium capitalize transition ${
                selectedTags.includes(tag)
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

        {isLoading ? (
          <p className="mt-8 text-sm text-zinc-500">Loading recipes...</p>
        ) : recipes.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-zinc-200 px-4 py-6 text-sm text-zinc-500">
            No recipes found. Try removing some filters and shuffling again.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
              >
                {recipe.image ? (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-zinc-100 text-zinc-400">
                    No image
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-semibold leading-snug text-zinc-950">
                    {recipe.title}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                      {recipe.readyInMinutes} min
                    </span>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                      {recipe.servings} {recipe.servings === 1 ? "serving" : "servings"}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                      {recipe.ingredientCount} ingredients
                    </span>
                  </div>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600">
                    {truncate(recipe.summary, 150)}
                  </p>

                  {recipe.sourceUrl ? (
                    <a
                      href={recipe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center text-sm font-medium text-emerald-600 transition hover:text-emerald-500"
                    >
                      View recipe
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
