import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PantryManager } from "../components/pantry-manager";

describe("PantryManager", () => {
  beforeEach(() => {
    const items = [
      {
        id: "item-1",
        name: "Flour",
        quantity: 2,
        unit: "cup",
        userId: "local-user",
        createdAt: "2026-04-14T00:00:00.000Z",
        updatedAt: "2026-04-14T00:00:00.000Z",
      },
      {
        id: "item-2",
        name: "Eggs",
        quantity: 12,
        unit: "unit",
        userId: "local-user",
        createdAt: "2026-04-14T00:00:00.000Z",
        updatedAt: "2026-04-14T00:00:00.000Z",
      },
    ];

    let currentItems = [...items];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? "GET";

        if (url === "/api/pantry" && method === "GET") {
          return {
            ok: true,
            json: async () => currentItems,
          };
        }

        if (url === "/api/pantry" && method === "POST") {
          const body = JSON.parse(String(init?.body));
          const nextItem = {
            id: "item-3",
            name: body.name,
            quantity: body.quantity,
            unit: body.unit,
            userId: "local-user",
            createdAt: "2026-04-14T00:00:00.000Z",
            updatedAt: "2026-04-14T00:00:00.000Z",
          };
          currentItems = [...currentItems, nextItem];

          return {
            ok: true,
            json: async () => nextItem,
          };
        }

        if (url === "/api/pantry/item-3" && method === "DELETE") {
          currentItems = currentItems.filter((item) => item.id !== "item-3");

          return {
            ok: true,
            json: async () => ({ success: true }),
          };
        }

        throw new Error(`Unhandled fetch: ${method} ${url}`);
      }),
    );
  });

  it("renders pantry items, stats, search, and add form controls", async () => {
    render(<PantryManager />);

    expect(await screen.findByRole("heading", { name: "Build a usable inventory" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search ingredients")).toBeInTheDocument();
    expect(screen.getByLabelText("Ingredient name")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    expect(screen.getByLabelText("Unit")).toBeInTheDocument();
    expect(screen.getByText("Flour")).toBeInTheDocument();
    expect(screen.getByText("Eggs")).toBeInTheDocument();
  });

  it("filters items by name and supports add/delete flows", async () => {
    render(<PantryManager />);

    expect(await screen.findByText("Eggs")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search ingredients"), {
      target: { value: "egg" },
    });

    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(screen.queryByText("Flour")).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search ingredients"), {
      target: { value: "" },
    });

    fireEvent.change(screen.getByLabelText("Ingredient name"), {
      target: { value: "Milk" },
    });
    fireEvent.change(screen.getByLabelText("Quantity"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Unit"), {
      target: { value: "l" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add ingredient" }));

    expect(await screen.findByText("Milk")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete Milk" }));

    expect(await screen.findByText("Eggs")).toBeInTheDocument();
  });
});
