import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CommandCenter, { type DashboardProfile } from "./command-center";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "onboarded, identity, directions, goals, weekly_hours, target_role, target_horizon, integrations",
    )
    .eq("id", user.id)
    .maybeSingle();

  // New members must finish onboarding first.
  if (!profile?.onboarded) {
    redirect("/onboarding");
  }

  return <CommandCenter profile={profile as DashboardProfile} />;
}
