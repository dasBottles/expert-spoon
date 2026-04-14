import { NextResponse } from "next/server";

import { preferencesApiSchema, emptyApiPayload } from "../../../lib/preferences";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const record = await prisma.userPreferences.findUnique({
    where: { id: "singleton" },
  });

  if (!record) {
    return NextResponse.json(emptyApiPayload());
  }

  return NextResponse.json({
    dietary_restrictions: record.dietaryRestrictions,
    allergies: record.allergies,
    cuisines: record.cuisines,
    prep_time_max: record.prepTimeMax,
    difficulty_max: record.difficultyMax,
    exclude_ingredients: record.excludeIngredients,
  });
}

export async function POST(request: Request) {
  try {
    const payload = preferencesApiSchema.parse(await request.json());

    const record = await prisma.userPreferences.upsert({
      where: { id: "singleton" },
      update: {
        dietaryRestrictions: payload.dietary_restrictions,
        allergies: payload.allergies,
        cuisines: payload.cuisines,
        prepTimeMax: payload.prep_time_max,
        difficultyMax: payload.difficulty_max,
        excludeIngredients: payload.exclude_ingredients,
      },
      create: {
        id: "singleton",
        dietaryRestrictions: payload.dietary_restrictions,
        allergies: payload.allergies,
        cuisines: payload.cuisines,
        prepTimeMax: payload.prep_time_max,
        difficultyMax: payload.difficulty_max,
        excludeIngredients: payload.exclude_ingredients,
      },
    });

    return NextResponse.json({
      id: record.id,
      dietary_restrictions: record.dietaryRestrictions,
      allergies: record.allergies,
      cuisines: record.cuisines,
      prep_time_max: record.prepTimeMax,
      difficulty_max: record.difficultyMax,
      exclude_ingredients: record.excludeIngredients,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid preferences payload." },
      { status: 400 },
    );
  }
}
