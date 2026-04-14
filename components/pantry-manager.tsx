"use client";

import { useEffect, useMemo, useState } from "react";

import {
  pantryItemCreateSchema,
  pantryItemsApiSchema,
  pantryUnits,
  toCreatePantryItemPayload,
  type PantryItemApiRecord,
} from "../lib/pantry";

const defaultFormState = {
  name: "",
  quantity: "1",
  unit: "unit",
};

export function PantryManager() {
  const [items, setItems] = useState<PantryItemApiRecord[]>([]);
  const [search, setSearch] = useState("");
  const [formValues, setFormValues] = useState(defaultFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPantry() {
      try {
        const response = await fetch("/api/pantry", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load pantry.");
        }

        const payload = pantryItemsApiSchema.parse(await response.json());
        setItems(payload);
      } catch {
        setError("Could not load pantry items.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadPantry();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return items;
    }

    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, search]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const parsed = pantryItemCreateSchema.parse(
        toCreatePantryItemPayload({
          name: formValues.name,
          quantity: Number(formValues.quantity),
          unit: formValues.unit as (typeof pantryUnits)[number],
        }),
      );

      const response = await fetch("/api/pantry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed),
      });

      if (!response.ok) {
        throw new Error("Failed to save pantry item.");
      }

      const nextItem = pantryItemCreateSchema.extend({
        id: pantryItemsApiSchema.element.shape.id,
        userId: pantryItemsApiSchema.element.shape.userId,
        createdAt: pantryItemsApiSchema.element.shape.createdAt,
        updatedAt: pantryItemsApiSchema.element.shape.updatedAt,
      }).parse(await response.json());

      setItems((current) => [...current, nextItem]);
      setFormValues(defaultFormState);
    } catch {
      setError("Could not save pantry item.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);

    try {
      const response = await fetch(`/api/pantry/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete pantry item.");
      }

      setItems((current) => current.filter((item) => item.id !== id));
    } catch {
      setError("Could not delete pantry item.");
    }
  }

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-12 sm:px-10">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Pantry
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">Build your pantry</h1>
            <p className="max-w-2xl text-base leading-7 text-zinc-600">
              Add ingredients you already have so the app can make better dinner suggestions.
            </p>
          </div>
          <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700">
            {items.length} {items.length === 1 ? "item" : "items"} total
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="pantry-search" className="text-sm font-medium text-zinc-900">
                Search ingredients
              </label>
              <input
                id="pantry-search"
                list="pantry-ingredient-options"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filter pantry by ingredient name"
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              />
              <datalist id="pantry-ingredient-options">
                {items.map((item) => (
                  <option key={item.id} value={item.name} />
                ))}
              </datalist>
            </div>

            {isLoading ? <p className="text-sm text-zinc-500">Loading pantry…</p> : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <ul className="space-y-3">
              {filteredItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 px-4 py-4"
                >
                  <div>
                    <p className="text-base font-semibold text-zinc-950">{item.name}</p>
                    <p className="text-sm text-zinc-500">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item.id)}
                    className="inline-flex items-center justify-center rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                    aria-label={`Delete ${item.name}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            {!isLoading && filteredItems.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-6 text-sm text-zinc-500">
                No pantry items match that search yet.
              </p>
            ) : null}
          </div>

          <form className="space-y-5 rounded-3xl border border-zinc-200 bg-zinc-50 p-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-zinc-950">Add Ingredient</h2>
              <p className="text-sm leading-6 text-zinc-600">
                Keep the pantry current so recipe filtering has real inventory to work with.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="ingredient-name" className="text-sm font-medium text-zinc-900">
                Ingredient name
              </label>
              <input
                id="ingredient-name"
                value={formValues.name}
                onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                placeholder="e.g. Rice"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="ingredient-quantity" className="text-sm font-medium text-zinc-900">
                  Quantity
                </label>
                <input
                  id="ingredient-quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formValues.quantity}
                  onChange={(event) => setFormValues((current) => ({ ...current, quantity: event.target.value }))}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="ingredient-unit" className="text-sm font-medium text-zinc-900">
                  Unit
                </label>
                <select
                  id="ingredient-unit"
                  value={formValues.unit}
                  onChange={(event) => setFormValues((current) => ({ ...current, unit: event.target.value }))}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none"
                >
                  {pantryUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {isSaving ? "Saving…" : "Add ingredient"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
