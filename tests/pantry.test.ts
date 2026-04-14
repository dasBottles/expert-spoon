import { describe, expect, it } from "vitest";

import {
  pantryItemApiSchema,
  pantryItemFormSchema,
  pantryUnits,
  toCreatePantryItemPayload,
  type PantryItemApiRecord,
} from "../lib/pantry";

describe("pantry helpers", () => {
  it("exposes supported units and shapes POST payloads", () => {
    expect(pantryUnits).toEqual(["unit", "g", "kg", "oz", "lb", "ml", "l", "cup", "tbsp", "tsp"]);

    const parsed = pantryItemFormSchema.parse({
      name: "  Flour  ",
      quantity: 2,
      unit: "cup",
    });

    expect(toCreatePantryItemPayload(parsed)).toEqual({
      name: "Flour",
      quantity: 2,
      unit: "cup",
    });
  });

  it("validates pantry API records", () => {
    const record: PantryItemApiRecord = pantryItemApiSchema.parse({
      id: "item-1",
      name: "Eggs",
      quantity: 12,
      unit: "unit",
      userId: "local-user",
      createdAt: "2026-04-14T00:00:00.000Z",
      updatedAt: "2026-04-14T00:00:00.000Z",
    });

    expect(record.name).toBe("Eggs");
  });

  it("rejects blank pantry item names", () => {
    const result = pantryItemFormSchema.safeParse({
      name: "   ",
      quantity: 1,
      unit: "unit",
    });

    expect(result.success).toBe(false);
  });
});
