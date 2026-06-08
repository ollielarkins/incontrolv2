import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageShell from "@/app/_components/page-shell";
import RoadmapBoard from "./roadmap-board";
import { ROADMAP_COLUMNS, type RoadmapNode } from "@/lib/roadmap";

export default async function RoadmapsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const [{ data: profile }, { data: nodes }] = await Promise.all([
    supabase.from("profiles").select("onboarded").eq("id", user.id).maybeSingle(),
    supabase
      .from("roadmap_nodes")
      .select(ROADMAP_COLUMNS)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  if (!profile?.onboarded) redirect("/onboarding");

  const today = new Date()
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  return (
    <PageShell active="ROADMAPS">
      <RoadmapBoard nodes={(nodes ?? []) as RoadmapNode[]} today={today} />
    </PageShell>
  );
}
