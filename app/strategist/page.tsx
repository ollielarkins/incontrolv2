import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageShell from "@/app/_components/page-shell";
import StrategistChat from "./strategist-chat";

export default async function StrategistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarded) redirect("/onboarding");

  const today = new Date()
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  return (
    <PageShell active="STRATEGIST">
      <StrategistChat today={today} />
    </PageShell>
  );
}
