"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import {
  cuisineOptions,
  cookingSkillOptions,
  defaultPreferences,
  emptyApiPayload,
  fromApiPayload,
  householdSizeOptions,
  preferencesApiSchema,
  preferencesFormSchema,
  timePreferenceOptions,
  toApiPayload,
  type PreferencesFormValues,
} from "../lib/preferences";

const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const dietCards = [
  { value: "vegetarian", label: "Vegetarian", blurb: "Plant-forward meals with everyday ingredients." },
  { value: "vegan", label: "Vegan", blurb: "Fully plant-based, clean and flexible." },
  { value: "keto", label: "Keto", blurb: "Low-carb, higher-protein dinner options." },
  { value: "paleo", label: "Paleo", blurb: "Whole-food focused, simple ingredient lists." },
  { value: "gluten-free", label: "Gluten free", blurb: "Avoid wheat without losing variety." },
  { value: "dairy-free", label: "Dairy free", blurb: "Comfort meals without milk-based ingredients." },
] as const;

export function OnboardingQuiz({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        const response = await fetch(`${appBasePath}/api/preferences`, { cache: "no-store" });
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

  const watchedValues = watch();
  const selectedDietTypes = watchedValues.dietType ?? [];
  const selectedCuisines = watchedValues.cuisinePreferences ?? [];
  const selectedAllergies = watchedValues.allergies?.trim() ? watchedValues.allergies.split(/[\n,]/).map((item) => item.trim()).filter(Boolean) : [];
  const timePreferenceValue = watchedValues.timePreference;

  const timePreferenceLabel = useMemo(
    () => (timePreferenceValue >= 60 ? "60+ minutes" : `${timePreferenceValue} minutes`),
    [timePreferenceValue],
  );

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSaveSuccess(false);
    setIsSubmittingForm(true);

    try {
      const parsedValues = preferencesFormSchema.parse(values);
      const response = await fetch(`${appBasePath}/api/preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toApiPayload(parsedValues)),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences.");
      }

      const payload = preferencesApiSchema.parse(await response.json());
      reset(fromApiPayload(payload));
      setSaveSuccess(true);
      router.push(`${appBasePath}/`);
      router.refresh();
    } catch {
      setSubmitError("Could not save your preferences. Please try again.");
    } finally {
      setIsSubmittingForm(false);
    }
  });

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--surface)] p-6 shadow-[var(--shadow)] backdrop-blur xl:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Expert Spoon
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              Smart dinner setup
            </span>
          </div>

          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              A dinner planner that actually feels tailored to your house.
            </h1>
            <p className="text-base leading-7 text-slate-300 sm:text-lg">
              Set your eating style, time budget, and comfort level once. Then we can turn this into
              fast, realistic dinner suggestions instead of generic recipe spam.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Prep time</p>
              <p className="mt-2 text-2xl font-semibold text-white">{timePreferenceLabel}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Diet filters</p>
              <p className="mt-2 text-2xl font-semibold text-white">{selectedDietTypes.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Cuisine picks</p>
              <p className="mt-2 text-2xl font-semibold text-white">{selectedCuisines.length}</p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-emerald-300/15 bg-gradient-to-br from-emerald-400/10 via-cyan-300/8 to-transparent p-5">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-200/90">Live summary</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedDietTypes.length > 0 ? selectedDietTypes.map((item) => (
                <span key={item} className="rounded-full bg-emerald-300/15 px-3 py-1 text-sm text-emerald-100">
                  {item}
                </span>
              )) : <span className="text-sm text-slate-400">No diet filters yet</span>}
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>
                Household: <span className="font-medium text-white">{watchedValues.householdSize} people</span>
              </p>
              <p>
                Cooking skill: <span className="font-medium capitalize text-white">{watchedValues.cookingSkill}</span>
              </p>
              <p>
                Allergies: <span className="font-medium text-white">{selectedAllergies.length > 0 ? selectedAllergies.join(", ") : "None listed"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[var(--surface-strong)] p-5 shadow-[var(--shadow)] backdrop-blur sm:p-6 xl:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">Preference setup</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Dial in your defaults</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
              6 steps
            </span>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <fieldset aria-label="Diet type" className="space-y-3">
              <legend className="text-base font-semibold text-white">1. Diet style</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {dietCards.map((option) => (
                  <label
                    key={option.value}
                    className={`group flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition ${
                      selectedDietTypes.includes(option.value)
                        ? "border-cyan-300/40 bg-cyan-300/10 shadow-lg shadow-cyan-950/20"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={option.value}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-cyan-300"
                      {...register("dietType")}
                    />
                    <span>
                      <span className="block text-sm font-medium text-white">{option.label}</span>
                      <span className="mt-1 block text-sm leading-6 text-slate-400">{option.blurb}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block space-y-2" aria-label="Allergies">
              <span className="text-base font-semibold text-white">2. Allergies</span>
              <textarea
                rows={3}
                placeholder="Peanuts, shellfish, tree nuts"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
                {...register("allergies")}
              />
              <span className="text-sm text-slate-400">Comma or line-separated, whatever is fastest.</span>
            </label>

            <fieldset aria-label="Cooking skill" className="space-y-3">
              <legend className="text-base font-semibold text-white">3. Cooking confidence</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {cookingSkillOptions.map((option) => {
                  const selected = watchedValues.cookingSkill === option;
                  return (
                    <label
                      key={option}
                      className={`cursor-pointer rounded-2xl border px-4 py-4 text-sm transition ${
                        selected
                          ? "border-emerald-300/40 bg-emerald-300/10 text-white"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                      }`}
                    >
                      <input type="radio" value={option} className="sr-only" {...register("cookingSkill")} />
                      <span className="block font-medium capitalize">{option}</span>
                      <span className="mt-1 block text-xs text-slate-400">
                        {option === "easy" ? "Low effort, fast wins" : option === "medium" ? "Comfortable with normal prep" : "Open to more involved recipes"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block space-y-2" aria-label="Household size">
                <span className="text-base font-semibold text-white">4. Household size</span>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
                  {...register("householdSize", { valueAsNumber: true })}
                >
                  {householdSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option} {option === 1 ? "person" : "people"}
                    </option>
                  ))}
                </select>
                {errors.householdSize ? <p className="text-sm text-rose-300">{errors.householdSize.message}</p> : null}
              </label>

              <div className="space-y-3" aria-label="Time preference">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-semibold text-white">5. Max prep time</span>
                  <span className="rounded-full bg-white/8 px-3 py-1 text-sm text-cyan-100">{timePreferenceLabel}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={timePreferenceOptions.length - 1}
                  step={1}
                  value={timePreferenceOptions.indexOf(timePreferenceValue as 15 | 30 | 45 | 60)}
                  className="w-full accent-cyan-300"
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
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-slate-500">
                  <span>Quick</span>
                  <span>Balanced</span>
                  <span>Flexible</span>
                </div>
                {errors.timePreference ? <p className="text-sm text-rose-300">{errors.timePreference.message}</p> : null}
              </div>
            </div>

            <label className="block space-y-2" aria-label="Cuisine preferences">
              <span className="text-base font-semibold text-white">6. Cuisine preferences</span>
              <select
                multiple
                className="min-h-44 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
                {...register("cuisinePreferences")}
              >
                {cuisineOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="text-sm text-slate-400">Ctrl/Cmd-click for multiple cuisines.</span>
            </label>

            {submitError ? <p className="text-sm text-rose-300">{submitError}</p> : null}
            {saveSuccess ? <p className="text-sm text-emerald-200">Preferences saved. Moving to pantry...</p> : null}

            <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                {isLoading ? "Loading saved preferences..." : "These preferences seed the recipe explorer and future filtering."}
              </p>
              <button
                type="submit"
                disabled={isLoading || isSubmittingForm}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingForm ? "Saving..." : "Save and continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
