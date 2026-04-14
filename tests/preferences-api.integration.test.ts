import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

const projectRoot = "/root/expert-spoon";
const originalDatabaseUrl = process.env.DATABASE_URL;
const tempDir = mkdtempSync(join(tmpdir(), "preferences-api-"));
const databaseUrl = `file:${join(tempDir, "test.db")}`;

type PreferencesRouteModule = typeof import("../app/api/preferences/route");
type PrismaModule = typeof import("../lib/prisma");

let routeModule: PreferencesRouteModule;
let prismaModule: PrismaModule;

const validPayload = {
  diet_type: ["vegetarian", "gluten-free"],
  allergies: ["peanuts", "shellfish"],
  cooking_skill: "easy",
  household_size: 4,
  time_preference: 45,
  cuisine_preferences: ["Italian", "Indian"],
};

beforeAll(async () => {
  execSync("npx prisma migrate deploy", {
    cwd: projectRoot,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdio: "pipe",
  });

  process.env.DATABASE_URL = databaseUrl;
  (globalThis as typeof globalThis & { prisma?: unknown }).prisma = undefined;
  vi.resetModules();

  [routeModule, prismaModule] = await Promise.all([
    import("../app/api/preferences/route"),
    import("../lib/prisma"),
  ]);
});

beforeEach(async () => {
  await prismaModule.prisma.userPreferences.deleteMany();
});

afterEach(async () => {
  await prismaModule.prisma.userPreferences.deleteMany();
});

afterAll(async () => {
  await prismaModule.prisma.$disconnect();
  process.env.DATABASE_URL = originalDatabaseUrl;
  (globalThis as typeof globalThis & { prisma?: unknown }).prisma = undefined;
  vi.resetModules();
  rmSync(tempDir, { force: true, recursive: true });
});

describe("preferences API integration", () => {
  it("stores all six onboarding answers and returns them from POST", async () => {
    const response = await routeModule.POST(
      new Request("http://localhost/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPayload),
      }),
    );

    expect([200, 201]).toContain(response.status);
    await expect(response.json()).resolves.toMatchObject({
      id: "singleton",
      diet_type: ["vegetarian", "gluten-free"],
      allergies: ["peanuts", "shellfish"],
      cooking_skill: "easy",
      household_size: 4,
      time_preference: 45,
      cuisine_preferences: ["Italian", "Indian"],
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });

    const record = await prismaModule.prisma.userPreferences.findUnique({
      where: { id: "singleton" },
    });

    expect(record).toMatchObject({
      id: "singleton",
      dietType: ["vegetarian", "gluten-free"],
      allergies: ["peanuts", "shellfish"],
      cookingSkill: "easy",
      householdSize: 4,
      timePreference: 45,
      cuisinePreferences: ["Italian", "Indian"],
    });
  });

  it("returns saved preferences from GET after the quiz is completed", async () => {
    await routeModule.POST(
      new Request("http://localhost/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPayload),
      }),
    );

    const response = await routeModule.GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(validPayload);
  });

  it("rejects incomplete submissions with a validation error", async () => {
    const response = await routeModule.POST(
      new Request("http://localhost/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diet_type: ["vegetarian"],
          allergies: ["peanuts"],
          cooking_skill: "easy",
          time_preference: 30,
          cuisine_preferences: ["Italian"],
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid preferences payload.",
      issues: expect.arrayContaining([
        expect.objectContaining({ path: "household_size" }),
      ]),
    });
    await expect(
      prismaModule.prisma.userPreferences.findUnique({ where: { id: "singleton" } }),
    ).resolves.toBeNull();
  });

  it("updates the existing record on duplicate submission", async () => {
    await routeModule.POST(
      new Request("http://localhost/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPayload),
      }),
    );

    const response = await routeModule.POST(
      new Request("http://localhost/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diet_type: ["vegan"],
          allergies: ["tree nuts"],
          cooking_skill: "medium",
          household_size: 2,
          time_preference: 30,
          cuisine_preferences: ["Asian"],
        }),
      }),
    );

    expect([200, 201]).toContain(response.status);
    const record = await prismaModule.prisma.userPreferences.findMany();
    expect(record).toHaveLength(1);
    expect(record[0]).toMatchObject({
      dietType: ["vegan"],
      allergies: ["tree nuts"],
      cookingSkill: "medium",
      householdSize: 2,
      timePreference: 30,
      cuisinePreferences: ["Asian"],
    });
  });

  it("rejects invalid enum and numeric values", async () => {
    const response = await routeModule.POST(
      new Request("http://localhost/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diet_type: ["carnivore"],
          allergies: ["peanuts"],
          cooking_skill: "expert",
          household_size: 0,
          time_preference: 999,
          cuisine_preferences: ["Martian"],
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Invalid preferences payload.",
      issues: expect.arrayContaining([
        expect.objectContaining({ path: "diet_type.0" }),
        expect.objectContaining({ path: "cooking_skill" }),
        expect.objectContaining({ path: "household_size" }),
        expect.objectContaining({ path: "time_preference" }),
        expect.objectContaining({ path: "cuisine_preferences.0" }),
      ]),
    });
    await expect(prismaModule.prisma.userPreferences.findMany()).resolves.toHaveLength(0);
  });
});
