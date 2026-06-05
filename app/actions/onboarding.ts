"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingData } from "@/lib/onboarding";

// Persists the user's onboarding answers and marks them onboarded, then sends
// them to the welcome splash. Returns an error string instead of redirecting
// when something goes wrong so the wizard can surface it.
export async function completeOnboarding(
  data: OnboardingData,
): Promise<{ error: string } | void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    onboarded: true,
    identity: data.identity,
    directions: data.directions,
    goals: data.goals,
    weekly_hours: data.weeklyHours,
    target_role: data.targetRole,
    target_horizon: data.targetHorizon,
    integrations: data.integrations,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    // Most likely cause: the `profiles` table/migration hasn't been run yet.
    return { error: error.message };
  }

  redirect("/welcome");
}
