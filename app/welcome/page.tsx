import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WelcomeSplash from "./welcome-splash";

export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  return <WelcomeSplash />;
}
