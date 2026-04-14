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
          dietary_restrictions: [],
          allergies: [],
          cuisines: [],
          prep_time_max: 30,
          difficulty_max: "medium",
          exclude_ingredients: [],
        }),
      }),
    );
  });

  it("renders all six onboarding questions and a save button", async () => {
    render(<OnboardingQuiz />);

    expect(screen.getByText("Let’s set up your preferences")).toBeInTheDocument();
    expect(screen.getByLabelText("Dietary restrictions")).toBeInTheDocument();
    expect(screen.getByLabelText("Allergies")).toBeInTheDocument();
    expect(screen.getByLabelText("Preferred cuisines")).toBeInTheDocument();
    expect(screen.getByLabelText("Max prep time")).toBeInTheDocument();
    expect(screen.getByLabelText("Cooking difficulty")).toBeInTheDocument();
    expect(screen.getByLabelText("Ingredients to exclude")).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Save preferences" }),
    ).toBeInTheDocument();
  });
});
