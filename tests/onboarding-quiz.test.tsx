import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OnboardingQuiz } from "../components/onboarding-quiz";

describe("OnboardingQuiz", () => {
  it("renders all six onboarding questions and a save button", () => {
    render(<OnboardingQuiz />);

    expect(screen.getByText("Let’s set up your preferences")).toBeInTheDocument();
    expect(screen.getByLabelText("Dietary restrictions")).toBeInTheDocument();
    expect(screen.getByLabelText("Allergies")).toBeInTheDocument();
    expect(screen.getByLabelText("Preferred cuisines")).toBeInTheDocument();
    expect(screen.getByLabelText("Max prep time")).toBeInTheDocument();
    expect(screen.getByLabelText("Cooking difficulty")).toBeInTheDocument();
    expect(screen.getByLabelText("Ingredients to exclude")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save preferences" }),
    ).toBeInTheDocument();
  });
});
