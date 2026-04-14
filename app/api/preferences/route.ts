import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { preferencesApiSchema, emptyApiPayload } from "../../../lib/preferences";
import { prisma } from "../../../lib/prisma";

function serializeRecord(record: {
  id: string;
  dietType: unknown;
  allergies: unknown;
  cookingSkill: string;
  householdSize: number;
  timePreference: number;
  cuisinePreferences: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: record.id,
    diet_type: record.dietType,
    allergies: record.allergies,
    cooking_skill: record.cookingSkill,
    household_size: record.householdSize,
    time_preference: record.timePreference,
    cuisine_preferences: record.cuisinePreferences,
    created_at: record.createdAt.toISOString(),
    updated_at: record.updatedAt.toISOString(),
  };
}

export async function GET() {
  const record = await prisma.userPreferences.findUnique({
    where: { id: "singleton" },
  });

  if (!record) {
    return NextResponse.json(emptyApiPayload());
  }

  return NextResponse.json({
    diet_type: record.dietType,
    allergies: record.allergies,
    cooking_skill: record.cookingSkill,
    household_size: record.householdSize,
    time_preference: record.timePreference,
    cuisine_preferences: record.cuisinePreferences,
  });
}

export async function POST(request: Request) {
  try {
    const payload = preferencesApiSchema.parse(await request.json());

    const record = await prisma.userPreferences.upsert({
      where: { id: "singleton" },
      update: {
        dietType: payload.diet_type,
        allergies: payload.allergies,
        cookingSkill: payload.cooking_skill,
        householdSize: payload.household_size,
        timePreference: payload.time_preference,
        cuisinePreferences: payload.cuisine_preferences,
      },
      create: {
        id: "singleton",
        dietType: payload.diet_type,
        allergies: payload.allergies,
        cookingSkill: payload.cooking_skill,
        householdSize: payload.household_size,
        timePreference: payload.time_preference,
        cuisinePreferences: payload.cuisine_preferences,
      },
    });

    return NextResponse.json(serializeRecord(record));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid preferences payload.",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Invalid preferences payload." },
      { status: 400 },
    );
  }
}
