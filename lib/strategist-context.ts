import "server-only";
import { createClient } from "@/lib/supabase/server";
import { fetchObjectives } from "@/lib/objectives-server";
import { progressOf } from "@/lib/objectives";
import { APPLICATION_COLUMNS, countsByStatus, type Application } from "@/lib/career";
import { TRANSACTION_COLUMNS, gbp, sumBy, thisMonthKey, type Transaction } from "@/lib/finance";

type Goal = { text: string; horizon: string };

// Builds a compact text snapshot of the user's data for the strategist to reason over.
export async function buildStrategistContext(userId: string): Promise<string> {
  const supabase = await createClient();

  const [{ data: profile }, objectives, { data: appRows }, { data: txRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("identity, directions, target_role, target_horizon, weekly_hours, goals")
      .eq("id", userId)
      .maybeSingle(),
    fetchObjectives(supabase, userId),
    supabase.from("applications").select(APPLICATION_COLUMNS).eq("user_id", userId),
    supabase.from("transactions").select(TRANSACTION_COLUMNS).eq("user_id", userId),
  ]);

  const lines: string[] = [];

  // Profile
  if (profile) {
    lines.push("## Profile");
    if (profile.identity) lines.push(`- Identity: ${profile.identity}`);
    if (profile.target_role) lines.push(`- Target role/skill: ${profile.target_role} (${profile.target_horizon ?? "no horizon"})`);
    if (profile.weekly_hours != null) lines.push(`- Weekly time commitment: ${profile.weekly_hours} hrs`);
    const directions = (profile.directions ?? []) as string[];
    if (directions.length) lines.push(`- Focus areas: ${directions.join(", ")}`);
    const goals = ((profile.goals ?? []) as Goal[]).filter((g) => g?.text?.trim());
    if (goals.length) lines.push(`- Onboarding goals: ${goals.map((g) => `${g.text} (${g.horizon})`).join("; ")}`);
  }

  // Objectives
  lines.push("\n## Objectives");
  if (objectives.length === 0) lines.push("- None yet.");
  for (const o of objectives) {
    const done = o.subtasks.filter((s) => s.done).length;
    lines.push(`- ${o.title} — ${progressOf(o.subtasks)}% (${done}/${o.subtasks.length} subtasks)${o.due_date ? `, due ${o.due_date}` : ""}${o.category ? `, ${o.category}` : ""}`);
  }

  // Career
  const apps = (appRows ?? []) as Application[];
  const c = countsByStatus(apps);
  lines.push("\n## Career pipeline");
  lines.push(`- Planned ${c.planned}, Applied ${c.applied}, Interview ${c.interview}, Accepted ${c.accepted}, Rejected ${c.rejected}`);
  const upcoming = apps.filter((a) => a.follow_up_on).sort((a, b) => (a.follow_up_on! < b.follow_up_on! ? -1 : 1)).slice(0, 3);
  for (const a of upcoming) lines.push(`- Follow-up: ${a.title} on ${a.follow_up_on}`);

  // Finance (this month)
  const txs = ((txRows ?? []) as Transaction[]).map((t) => ({ ...t, amount: Number(t.amount) }));
  const month = txs.filter((t) => t.occurred_on.slice(0, 7) === thisMonthKey());
  const income = sumBy(month, "income");
  const spend = sumBy(month, "expense");
  lines.push("\n## Finance (this month)");
  lines.push(`- Income ${gbp(income)}, Spend ${gbp(spend)}, Net ${gbp(income - spend)} across ${month.length} transactions`);
  const subs = txs.filter((t) => t.recurring && t.kind === "expense").reduce((a, t) => a + t.amount, 0);
  if (subs > 0) lines.push(`- Recurring subscriptions: ${gbp(subs)}/mo`);

  return lines.join("\n");
}
