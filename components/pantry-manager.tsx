"use client";

import { useEffect, useMemo, useState } from "react";

const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
        const response = await fetch(`${appBasePath}/api/pantry`, { cache: "no-store" });
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

  const totalItems = items.length;
  const lowStockCount = items.filter((item) => item.quantity <= 1).length;

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

      const response = await fetch(`${appBasePath}/api/pantry`, {
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

      setItems((current) => [nextItem, ...current]);
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
      const response = await fetch(`${appBasePath}/api/pantry/${id}`, {
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
    <section className="mx-auto flex min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full rounded-[2rem] border border-white/10 bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur sm:p-6 xl:p-8">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Pantry</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Build a usable inventory</h1>
            <p className="text-base leading-7 text-slate-300">
              Keep this lightweight. A decent pantry snapshot is enough to make recipe suggestions feel way more relevant.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[24rem]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Total items</p>
              <p className="mt-2 text-2xl font-semibold text-white">{totalItems}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Low stock</p>
              <p className="mt-2 text-2xl font-semibold text-white">{lowStockCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Visible</p>
              <p className="mt-2 text-2xl font-semibold text-white">{filteredItems.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="order-2 xl:order-1">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Current pantry</h2>
                <p className="mt-1 text-sm text-slate-400">Search, scan, and trim what is actually in the kitchen.</p>
              </div>
              <label className="block min-w-0 sm:w-[22rem]">
                <span className="sr-only">Search ingredients</span>
                <input
                  id="pantry-search"
                  list="pantry-ingredient-options"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search ingredients"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
                />
              </label>
              <datalist id="pantry-ingredient-options">
                {items.map((item) => (
                  <option key={item.id} value={item.name} />
                ))}
              </datalist>
            </div>

            {isLoading ? <p className="text-sm text-slate-400">Loading pantry...</p> : null}
            {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}

            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/[0.07]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.quantity <= 1 ? "bg-amber-300/15 text-amber-100" : "bg-emerald-300/15 text-emerald-100"}`}>
                      {item.quantity <= 1 ? "Low" : "Stocked"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pantry item</p>
                    <button
                      type="button"
                      onClick={() => void handleDelete(item.id)}
                      className="inline-flex items-center justify-center rounded-full border border-rose-300/20 px-3 py-1.5 text-sm font-medium text-rose-200 transition hover:bg-rose-300/10"
                      aria-label={`Delete ${item.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {!isLoading && filteredItems.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-slate-400">
                No pantry items match that search yet.
              </div>
            ) : null}
          </div>

          <div className="order-1 xl:order-2">
            <form className="sticky top-6 space-y-5 rounded-[1.75rem] border border-cyan-300/12 bg-[var(--surface-strong)] p-5 shadow-[var(--shadow)]" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Quick add</p>
                <h2 className="text-2xl font-semibold text-white">Add ingredient</h2>
                <p className="text-sm leading-6 text-slate-400">
                  Don’t overthink units. Just get enough inventory in here that the matching logic has something useful to work with.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="ingredient-name" className="text-sm font-medium text-slate-200">
                  Ingredient name
                </label>
                <input
                  id="ingredient-name"
                  value={formValues.name}
                  onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Rice, chicken thighs, spinach"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="ingredient-quantity" className="text-sm font-medium text-slate-200">
                    Quantity
                  </label>
                  <input
                    id="ingredient-quantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formValues.quantity}
                    onChange={(event) => setFormValues((current) => ({ ...current, quantity: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="ingredient-unit" className="text-sm font-medium text-slate-200">
                    Unit
                  </label>
                  <select
                    id="ingredient-unit"
                    value={formValues.unit}
                    onChange={(event) => setFormValues((current) => ({ ...current, unit: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
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
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Add ingredient"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
