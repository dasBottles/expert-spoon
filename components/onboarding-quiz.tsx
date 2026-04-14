"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import {
  cuisineOptions,
  cookingSkillOptions,
  defaultPreferences,
  dietTypeOptions,
  emptyApiPayload,
  fromApiPayload,
  householdSizeOptions,
  preferencesApiSchema,
  preferencesFormSchema,
  timePreferenceOptions,
  toApiPayload,
  type PreferencesFormValues,
} from "../lib/preferences";

export function OnboardingQuiz() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PreferencesFormValues>({
    defaultValues: defaultPreferences,
  });

  useEffect(() => {
    async function loadPreferences() {
      try {
        const response = await fetch("/api/preferences", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load saved preferences.");
        }

        const payload = preferencesApiSchema.parse(await response.json());
        reset(fromApiPayload(payload));
      } catch {
        reset(fromApiPayload(emptyApiPayload()));
      } finally {
        setIsLoading(false);
      }
    }

    void loadPreferences();
  }, [reset]);

  const timePreferenceValue = watch("timePreference");
  const timePreferenceLabel = useMemo(
    () => (timePreferenceValue >= 60 ? "60+ minutes" : `${timePreferenceValue} minutes`),
    [timePreferenceValue],
  );

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmittingForm(true);

    try {
      const parsedValues = preferencesFormSchema.parse(values);
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toApiPayload(parsedValues)),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences.");
      }

      router.push("/pantry");
      router.refresh();
    } catch {
      setSubmitError("Could not save your preferences. Please try again.");
    } finally {
      setIsSubmittingForm(false);
    }
  });

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-12 sm:px-10">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Dinner Decision App
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
            Let’s set up your preferences
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-600">
            Answer six quick questions so recipe suggestions match how your household actually eats.
          </p>
        </div>

        <form className="space-y-8" onSubmit={onSubmit}>
          <fieldset aria-label="Diet type" className="space-y-3">
            <legend className="text-lg font-medium text-zinc-950">1. Diet type</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {dietTypeOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-700"
                >
                  <input
                    type="checkbox"
                    value={option}
                    className="h-4 w-4 rounded border-zinc-300 text-emerald-600"
                    {...register("dietType")}
                  />
                  <span className="capitalize">{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block space-y-2" aria-label="Allergies">
            <span className="text-lg font-medium text-zinc-950">2. Allergies</span>
            <textarea
              rows={3}
              placeholder="e.g. peanuts, shellfish, tree nuts"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400"
              {...register("allergies")}
            />
            <span className="text-sm text-zinc-500">Separate multiple allergies with commas or new lines.</span>
          </label>

          <fieldset aria-label="Cooking skill" className="space-y-3">
            <legend className="text-lg font-medium text-zinc-950">3. Cooking skill</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {cookingSkillOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3 text-sm capitalize text-zinc-700"
                >
                  <input
                    type="radio"
                    value={option}
                    className="h-4 w-4 border-zinc-300 text-emerald-600"
                    {...register("cookingSkill")}
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block space-y-2" aria-label="Household size">
            <span className="text-lg font-medium text-zinc-950">4. Household size</span>
            <select
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none"
              {...register("householdSize", { valueAsNumber: true })}
            >
              {householdSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} {option === 1 ? "person" : "people"}
                </option>
              ))}
            </select>
            {errors.householdSize ? (
              <p className="text-sm text-red-600">{errors.householdSize.message}</p>
            ) : null}
          </label>

          <label className="block space-y-3" aria-label="Time preference">
            <span className="text-lg font-medium text-zinc-950">5. Time preference</span>
            <input
              type="range"
              min={0}
              max={timePreferenceOptions.length - 1}
              step={1}
              value={timePreferenceOptions.indexOf(timePreferenceValue as 15 | 30 | 45 | 60)}
              className="w-full accent-emerald-600"
              onChange={(event) => {
                const nextValue = timePreferenceOptions[Number(event.target.value)] ?? defaultPreferences.timePreference;
                reset(
                  {
                    ...watch(),
                    timePreference: nextValue,
                  },
                  { keepDirty: true, keepTouched: true },
                );
              }}
            />
            <input type="hidden" {...register("timePreference", { valueAsNumber: true })} />
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>15 min</span>
              <span className="font-medium text-zinc-800">{timePreferenceLabel}</span>
              <span>60+ min</span>
            </div>
            {errors.timePreference ? (
              <p className="text-sm text-red-600">{errors.timePreference.message}</p>
            ) : null}
          </label>

          <label className="block space-y-2" aria-label="Cuisine preferences">
            <span className="text-lg font-medium text-zinc-950">6. Cuisine preferences</span>
            <select
              multiple
              className="min-h-40 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none"
              {...register("cuisinePreferences")}
            >
              {cuisineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-zinc-500">Hold Ctrl/Cmd to select more than one cuisine.</span>
          </label>

          {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

          <div className="flex flex-col gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              {isLoading ? "Loading saved preferences…" : "Your answers will be reused for recipe search."}
            </p>
            <button
              type="submit"
              disabled={isLoading || isSubmittingForm}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {isSubmittingForm ? "Saving…" : "Save preferences"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
