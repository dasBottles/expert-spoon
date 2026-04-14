import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

import { OnboardingQuiz } from "../components/onboarding-quiz";

describe("OnboardingQuiz", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          diet_type: [],
          allergies: [],
          cooking_skill: "medium",
          household_size: 2,
          time_preference: 30,
          cuisine_preferences: [],
        }),
      }),
    );
  });

  it("renders all six onboarding questions and a save button", async () => {
    render(<OnboardingQuiz />);

    expect(screen.getByText("Let’s set up your preferences")).toBeInTheDocument();
    expect(screen.getByLabelText("Diet type")).toBeInTheDocument();
    expect(screen.getByLabelText("Allergies")).toBeInTheDocument();
    expect(screen.getByLabelText("Cooking skill")).toBeInTheDocument();
    expect(screen.getByLabelText("Household size")).toBeInTheDocument();
    expect(screen.getByLabelText("Time preference")).toBeInTheDocument();
    expect(screen.getByLabelText("Cuisine preferences")).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Save preferences" }),
    ).toBeInTheDocument();
  });
});
