import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPantryItem } = vi.hoisted(() => ({
  mockPantryItem: {
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../lib/prisma", () => ({
  prisma: {
    pantryItem: mockPantryItem,
  },
}));

import { DELETE } from "../app/api/pantry/[id]/route";
import { GET, POST } from "../app/api/pantry/route";

describe("pantry API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists pantry items", async () => {
    mockPantryItem.findMany.mockResolvedValueOnce([
      {
        id: "item-1",
        name: "Eggs",
        quantity: 12,
        unit: "unit",
        userId: "local-user",
        createdAt: new Date("2026-04-14T00:00:00.000Z"),
        updatedAt: new Date("2026-04-14T00:00:00.000Z"),
      },
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        id: "item-1",
        name: "Eggs",
        quantity: 12,
        unit: "unit",
        userId: "local-user",
        createdAt: "2026-04-14T00:00:00.000Z",
        updatedAt: "2026-04-14T00:00:00.000Z",
      },
    ]);
    expect(mockPantryItem.findMany).toHaveBeenCalledWith({
      where: { userId: "local-user" },
      orderBy: { name: "asc" },
    });
  });

  it("creates a pantry item", async () => {
    mockPantryItem.create.mockResolvedValueOnce({
      id: "item-2",
      name: "Flour",
      quantity: 2,
      unit: "cup",
      userId: "local-user",
      createdAt: new Date("2026-04-14T00:00:00.000Z"),
      updatedAt: new Date("2026-04-14T00:00:00.000Z"),
    });

    const response = await POST(
      new Request("http://localhost/api/pantry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Flour", quantity: 2, unit: "cup" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      id: "item-2",
      name: "Flour",
      quantity: 2,
      unit: "cup",
      userId: "local-user",
    });
    expect(mockPantryItem.create).toHaveBeenCalledWith({
      data: {
        name: "Flour",
        quantity: 2,
        unit: "cup",
        userId: "local-user",
      },
    });
  });

  it("deletes a pantry item by id", async () => {
    mockPantryItem.delete.mockResolvedValueOnce({
      id: "item-2",
      name: "Flour",
      quantity: 2,
      unit: "cup",
      userId: "local-user",
      createdAt: new Date("2026-04-14T00:00:00.000Z"),
      updatedAt: new Date("2026-04-14T00:00:00.000Z"),
    });

    const response = await DELETE(new Request("http://localhost/api/pantry/item-2"), {
      params: Promise.resolve({ id: "item-2" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(mockPantryItem.delete).toHaveBeenCalledWith({
      where: { id: "item-2" },
    });
  });
});
