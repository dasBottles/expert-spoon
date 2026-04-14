import { z } from "zod";

export const pantryUnits = ["unit", "g", "kg", "oz", "lb", "ml", "l", "cup", "tbsp", "tsp"] as const;

const pantryUnitEnum = z.enum(pantryUnits);

export const pantryItemFormSchema = z.object({
  name: z.string().trim().min(1, "Enter an ingredient name."),
  quantity: z.coerce.number().positive("Quantity must be greater than zero."),
  unit: pantryUnitEnum,
});

export const pantryItemCreateSchema = z.object({
  name: z.string().trim().min(1, "Enter an ingredient name."),
  quantity: z.coerce.number().positive("Quantity must be greater than zero."),
  unit: pantryUnitEnum,
});

export const pantryItemApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit: pantryUnitEnum,
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const pantryItemsApiSchema = z.array(pantryItemApiSchema);

export type PantryItemFormValues = z.infer<typeof pantryItemFormSchema>;
export type PantryItemCreatePayload = z.infer<typeof pantryItemCreateSchema>;
export type PantryItemApiRecord = z.infer<typeof pantryItemApiSchema>;

export function normalizePantryItemName(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function toCreatePantryItemPayload(values: PantryItemFormValues): PantryItemCreatePayload {
  return {
    name: normalizePantryItemName(values.name),
    quantity: values.quantity,
    unit: values.unit,
  };
}
