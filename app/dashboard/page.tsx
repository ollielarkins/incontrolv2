import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proxy already guards this route, but check again close to the data.
  if (!user) {
    redirect("/");
  }

  // New members must finish onboarding first. A missing row counts as
  // not-onboarded, so they get sent through the flow.
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarded) {
    redirect("/onboarding");
  }

  const role = (user.user_metadata?.role as string | undefined) ?? null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-4"
      style={{ background: "#191919", color: "#FFFFF0" }}
    >
      <h1
        style={{
          fontFamily: "'IntroRust', sans-serif",
          fontSize: "2.5rem",
          letterSpacing: "0.03em",
        }}
      >
        You&apos;re in control.
      </h1>
      <p style={{ fontFamily: "'GlacialIndifference', sans-serif", opacity: 0.7 }}>
        Signed in as {user.email}
        {role ? ` · ${role}` : ""}
      </p>
      <form action={signOut}>
        <button
          type="submit"
          className="py-2.5 px-6 rounded text-sm font-medium tracking-wide transition-all"
          style={{
            fontFamily: "'GlacialIndifference', sans-serif",
            background: "rgba(181,144,90,0.18)",
            border: "1px solid #B5905A",
            color: "#FFFFF0",
          }}
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
