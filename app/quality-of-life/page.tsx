import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageShell from "@/app/_components/page-shell";
import QolBoard from "./qol-board";
import { QOL_COLUMNS, emptyQol, type Qol } from "@/lib/qol";

export default async function QualityOfLifePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Profile gate + QoL row in parallel.
  const [{ data: profile }, { data: qolRow }] = await Promise.all([
    supabase.from("profiles").select("onboarded").eq("id", user.id).maybeSingle(),
    supabase.from("quality_of_life").select(QOL_COLUMNS).eq("id", user.id).maybeSingle(),
  ]);

  if (!profile?.onboarded) redirect("/onboarding");

  const qol: Qol = { ...emptyQol(), ...(qolRow ?? {}) };

  const today = new Date()
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  return (
    <PageShell active="QUALITY OF LIFE">
      <QolBoard qol={qol} today={today} />
    </PageShell>
  );
}
