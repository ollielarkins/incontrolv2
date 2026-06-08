import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchObjectives, seedObjectivesFromGoals } from "@/lib/objectives-server";
import { APPLICATION_COLUMNS, countsByStatus, type Application } from "@/lib/career";
import { TRANSACTION_COLUMNS, byCategory, sumBy, thisMonthKey, type Transaction } from "@/lib/finance";
import CommandCenter, { type DashboardProfile } from "./command-center";

type Goal = { text: string; horizon: string };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Profile + objectives + applications + transactions in parallel.
  const [{ data: profile }, initial, { data: apps }, { data: txRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "onboarded, identity, directions, goals, weekly_hours, target_role, target_horizon, integrations",
      )
      .eq("id", user.id)
      .maybeSingle(),
    fetchObjectives(supabase, user.id),
    supabase.from("applications").select(APPLICATION_COLUMNS).eq("user_id", user.id),
    supabase.from("transactions").select(TRANSACTION_COLUMNS).eq("user_id", user.id),
  ]);

  // New members must finish onboarding first.
  if (!profile?.onboarded) {
    redirect("/onboarding");
  }

  const objectives =
    initial.length > 0
      ? initial
      : await seedObjectivesFromGoals(supabase, user.id, (profile.goals ?? []) as Goal[]);

  const applications = (apps ?? []) as Application[];
  const counts = countsByStatus(applications);
  const career = {
    interviews: counts.interview,
    offers: counts.accepted,
    prospected: counts.planned,
    accepted: counts.accepted,
    total: applications.length,
  };

  const txs = ((txRows ?? []) as Transaction[]).map((t) => ({ ...t, amount: Number(t.amount) }));
  const month = txs.filter((t) => t.occurred_on.slice(0, 7) === thisMonthKey());
  const finance = {
    income: sumBy(month, "income"),
    spend: sumBy(month, "expense"),
    net: sumBy(month, "income") - sumBy(month, "expense"),
    count: month.length,
    topSpend: byCategory(month, "expense")[0]?.category ?? null,
    topIncome: byCategory(month, "income")[0]?.category ?? null,
  };

  return (
    <CommandCenter
      profile={profile as DashboardProfile}
      objectives={objectives}
      career={career}
      finance={finance}
    />
  );
}
