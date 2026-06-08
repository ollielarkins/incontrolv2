import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { OBJECTIVE_COLUMNS, type Objective } from "@/lib/objectives";

type Goal = { text: string; horizon: string };

// Reads the user's objectives. Takes an existing client so callers can run this
// in parallel with other queries instead of opening a second connection.
export async function fetchObjectives(
  supabase: SupabaseClient,
  userId: string,
): Promise<Objective[]> {
  const { data } = await supabase
    .from("objectives")
    .select(OBJECTIVE_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Objective[];
}

// Seeds objectives from onboarding goals (first visit only) and returns them.
export async function seedObjectivesFromGoals(
  supabase: SupabaseClient,
  userId: string,
  goals: Goal[],
): Promise<Objective[]> {
  const clean = (goals ?? []).filter((g) => g?.text?.trim());
  if (clean.length === 0) return [];

  await supabase.from("objectives").insert(
    clean.map((g) => ({
      user_id: userId,
      title: g.text.trim(),
      topic: g.horizon ? g.horizon.toUpperCase() : null,
      category: g.horizon ? g.horizon[0].toUpperCase() + g.horizon.slice(1) : null,
      subtasks: [],
    })),
  );

  return fetchObjectives(supabase, userId);
}
