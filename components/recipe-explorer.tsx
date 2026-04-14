"use client";

import { useCallback, useEffect, useState } from "react";

const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

import { recipeCardsSchema, type RecipeCard } from "../lib/recipes";
import { dietTypeOptions } from "../lib/preferences";

const filterCopy: Record<string, string> = {
  vegetarian: "Plant-forward",
  vegan: "Fully plant-based",
  keto: "Low carb",
  paleo: "Whole-food focused",
  "gluten-free": "No wheat",
  "dairy-free": "No dairy",
};

export function RecipeExplorer() {
  const [recipes, setRecipes] = useState<RecipeCard[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async (tags: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ number: "6" });
      if (tags.length > 0) {
        params.set("tags", tags.join(","));
      }
      const response = await fetch(`${appBasePath}/api/recipes?${params.toString()}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch recipes.");
      }
      const data = recipeCardsSchema.parse(await response.json());
      setRecipes(data);
    } catch {
      setError("Could not load recipes. Add the Spoonacular key or try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      let tags: string[] = [];
      try {
        const response = await fetch(`${appBasePath}/api/preferences`, { cache: "no-store" });
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
    <section className="mx-auto flex min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full rounded-[2rem] border border-white/10 bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur sm:p-6 xl:p-8">
        <div className="grid gap-5 border-b border-white/10 pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Recipe explorer
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {selectedTags.length > 0 ? `${selectedTags.length} active filters` : "No active filters"}
              </span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Find dinner ideas without digging.</h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300">
              Pull fresh recipe cards, keep the vibe clean, and iterate fast. This should feel more like a polished browse surface than a demo page.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <a
            href={`${appBasePath}/preferences`}
            className="text-sm font-medium text-cyan-200 transition hover:text-white"
          >
            Edit preferences
          </a>

          <button
            type="button"
            onClick={handleShuffle}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Refreshing..." : "Shuffle recipes"}
          </button>
        </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[18rem_1fr]">
          <aside className="rounded-[1.75rem] border border-white/10 bg-[var(--surface-strong)] p-5">
            <h2 className="text-lg font-semibold text-white">Diet filters</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Match the feed to the household defaults or widen it if you just want inspiration.
            </p>

            <div className="mt-5 space-y-3">
              {dietTypeOptions.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`flex w-full items-start justify-between rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? "border-cyan-300/40 bg-cyan-300/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-medium capitalize text-white">{tag}</span>
                      <span className="mt-1 block text-xs text-slate-400">{filterCopy[tag]}</span>
                    </span>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${active ? "bg-cyan-200/20 text-cyan-100" : "bg-white/8 text-slate-400"}`}>
                      {active ? "On" : "Off"}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div>
            {error ? (
              <div className="mb-5 rounded-[1.5rem] border border-rose-300/20 bg-rose-300/10 px-4 py-4 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
                    <div className="h-48 animate-pulse bg-white/8" />
                    <div className="space-y-3 p-5">
                      <div className="h-4 animate-pulse rounded bg-white/8" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-white/8" />
                      <div className="h-16 animate-pulse rounded bg-white/8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recipes.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-slate-400">
                No recipes found. Remove a filter or shuffle again.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {recipes.map((recipe) => (
                  <article
                    key={recipe.id}
                    className="group overflow-hidden rounded-[1.6rem] border border-white/10 bg-[var(--surface-strong)] transition hover:-translate-y-0.5 hover:border-cyan-300/20"
                  >
                    {recipe.image ? (
                      <img src={recipe.image} alt={recipe.title} className="h-52 w-full object-cover" />
                    ) : (
                      <div className="flex h-52 w-full items-center justify-center bg-white/5 text-slate-500">No image</div>
                    )}

                    <div className="p-5">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-slate-200">
                          {recipe.readyInMinutes} min
                        </span>
                        <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-slate-200">
                          {recipe.servings} {recipe.servings === 1 ? "serving" : "servings"}
                        </span>
                        <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-slate-200">
                          {recipe.ingredientCount} ingredients
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-semibold leading-tight text-white">{recipe.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-slate-300">{truncate(recipe.summary, 180)}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {recipe.ingredients.slice(0, 3).map((ingredient) => (
                          <span key={ingredient} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                            {ingredient}
                          </span>
                        ))}
                      </div>

                      {recipe.sourceUrl ? (
                        <a
                          href={recipe.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex items-center text-sm font-semibold text-cyan-200 transition hover:text-white"
                        >
                          View recipe
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
