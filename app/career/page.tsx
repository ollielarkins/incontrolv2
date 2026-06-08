import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageShell from "@/app/_components/page-shell";
import CareerBoard from "./career-board";
import { APPLICATION_COLUMNS, type Application } from "@/lib/career";

export default async function CareerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const [{ data: profile }, { data: apps }] = await Promise.all([
    supabase.from("profiles").select("onboarded").eq("id", user.id).maybeSingle(),
    supabase
      .from("applications")
      .select(APPLICATION_COLUMNS)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile?.onboarded) redirect("/onboarding");

  const today = new Date()
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  return (
    <PageShell active="CAREER">
      <CareerBoard applications={(apps ?? []) as Application[]} today={today} />
    </PageShell>
  );
}
