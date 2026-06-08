import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageShell from "@/app/_components/page-shell";
import ObjectivesBoard from "./objectives-board";
import { fetchObjectives, seedObjectivesFromGoals } from "@/lib/objectives-server";

type Goal = { text: string; horizon: string };

export default async function ObjectivesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Profile + objectives in parallel (independent queries).
  const [{ data: profile }, initial] = await Promise.all([
    supabase.from("profiles").select("onboarded, goals").eq("id", user.id).maybeSingle(),
    fetchObjectives(supabase, user.id),
  ]);

  if (!profile?.onboarded) redirect("/onboarding");

  const objectives =
    initial.length > 0
      ? initial
      : await seedObjectivesFromGoals(supabase, user.id, (profile.goals ?? []) as Goal[]);

  const today = new Date()
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  return (
    <PageShell active="OBJECTIVES">
      <ObjectivesBoard objectives={objectives} today={today} />
    </PageShell>
  );
}
