import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RecipeExplorer } from "../components/recipe-explorer";

const mockRecipes = [
  {
    id: 1,
    title: "Spaghetti Bolognese",
    image: "https://img.spoonacular.com/1.jpg",
    readyInMinutes: 45,
    servings: 4,
    sourceUrl: "https://example.com/spaghetti",
    summary: "A classic Italian pasta dish with rich meat sauce.",
    ingredientCount: 8,
    ingredients: ["spaghetti", "ground beef", "tomato sauce"],
  },
  {
    id: 2,
    title: "Caesar Salad",
    image: "https://img.spoonacular.com/2.jpg",
    readyInMinutes: 15,
    servings: 2,
    sourceUrl: "https://example.com/caesar",
    summary: "Crispy romaine lettuce with creamy Caesar dressing.",
    ingredientCount: 5,
    ingredients: ["romaine", "croutons", "parmesan"],
  },
];

describe("RecipeExplorer", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("/api/preferences")) {
          return {
            ok: true,
            json: async () => ({
              diet_type: [],
              allergies: [],
              cooking_skill: "medium",
              household_size: 2,
              time_preference: 30,
              cuisine_preferences: [],
            }),
          };
        }

        if (url.includes("/api/recipes")) {
          return {
            ok: true,
            json: async () => mockRecipes,
          };
        }

        throw new Error(`Unhandled fetch: ${url}`);
      }),
    );
  });

  it("renders recipe cards with title, time, and servings", async () => {
    render(<RecipeExplorer />);

    expect(await screen.findByText("Spaghetti Bolognese")).toBeInTheDocument();
    expect(screen.getByText("Caesar Salad")).toBeInTheDocument();
    expect(screen.getByText("45 min")).toBeInTheDocument();
    expect(screen.getByText("4 servings")).toBeInTheDocument();
    expect(screen.getByText("15 min")).toBeInTheDocument();
    expect(screen.getByText("2 servings")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    render(<RecipeExplorer />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows error state when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/api/preferences")) {
          return { ok: true, json: async () => ({ diet_type: [] }) };
        }
        return { ok: false };
      }),
    );

    render(<RecipeExplorer />);

    expect(await screen.findByText("Could not load recipes. Please try again.")).toBeInTheDocument();
  });

  it("re-fetches when shuffle button is clicked", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/preferences")) {
        return { ok: true, json: async () => ({ diet_type: [] }) };
      }
      if (url.includes("/api/recipes")) {
        return { ok: true, json: async () => mockRecipes };
      }
      throw new Error(`Unhandled fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<RecipeExplorer />);

    await screen.findByText("Spaghetti Bolognese");

    const recipeCallsBefore = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("/api/recipes"),
    ).length;

    fireEvent.click(screen.getByRole("button", { name: "Shuffle recipes" }));

    await waitFor(() => {
      const recipeCallsAfter = fetchMock.mock.calls.filter(([url]) =>
        String(url).includes("/api/recipes"),
      ).length;
      expect(recipeCallsAfter).toBe(recipeCallsBefore + 1);
    });
  });

  it("renders diet filter pills", async () => {
    render(<RecipeExplorer />);

    await screen.findByText("Spaghetti Bolognese");

    expect(screen.getByRole("button", { name: "vegetarian" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "vegan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "keto" })).toBeInTheDocument();
  });

  it("renders view recipe links", async () => {
    render(<RecipeExplorer />);

    const links = await screen.findAllByText("View recipe");
    expect(links).toHaveLength(2);
    expect(links[0].closest("a")).toHaveAttribute("href", "https://example.com/spaghetti");
    expect(links[1].closest("a")).toHaveAttribute("href", "https://example.com/caesar");
  });
});
