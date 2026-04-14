import { NextResponse } from "next/server";

import { pantryItemApiSchema, pantryItemCreateSchema } from "../../../lib/pantry";
import { prisma } from "../../../lib/prisma";

const DEFAULT_USER_ID = "local-user";

function serializePantryItem(record: {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return pantryItemApiSchema.parse({
    id: record.id,
    name: record.name,
    quantity: record.quantity,
    unit: record.unit,
    userId: record.userId,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  });
}

export async function GET() {
  const items = await prisma.pantryItem.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(items.map(serializePantryItem));
}

export async function POST(request: Request) {
  try {
    const payload = pantryItemCreateSchema.parse(await request.json());

    const record = await prisma.pantryItem.create({
      data: {
        name: payload.name,
        quantity: payload.quantity,
        unit: payload.unit,
        userId: DEFAULT_USER_ID,
      },
    });

    return NextResponse.json(serializePantryItem(record));
  } catch {
    return NextResponse.json({ error: "Invalid pantry item payload." }, { status: 400 });
  }
}
