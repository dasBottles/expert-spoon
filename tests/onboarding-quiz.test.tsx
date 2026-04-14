import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.stubGlobal(
  "fetch",
  vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";

    if (url === "/api/preferences" && method === "GET") {
      return {
        ok: true,
        json: async () => ({
          diet_type: [],
          allergies: [],
          cooking_skill: "medium",
          household_size: 2,
          time_preference: 30,
          cuisine_preferences: [],
        }),
      };
    }

    if (url === "/api/preferences" && method === "POST") {
      push("/");
      refresh();
      return {
        ok: true,
        json: async () => ({
          id: "singleton",
          diet_type: [],
          allergies: [],
          cooking_skill: "medium",
          household_size: 2,
          time_preference: 30,
          cuisine_preferences: [],
        }),
      };
    }

    throw new Error(`Unhandled fetch: ${method} ${url}`);
  }),
);

import { OnboardingQuiz } from "../components/onboarding-quiz";

describe("OnboardingQuiz", () => {
  it("renders onboarding shell", async () => {
    render(<OnboardingQuiz />);

    expect(await screen.findByText("Dial in your defaults")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save and continue" })).toBeInTheDocument();
  });
});
