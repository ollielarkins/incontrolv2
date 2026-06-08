import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageShell from "@/app/_components/page-shell";
import FinanceBoard from "./finance-board";
import { TRANSACTION_COLUMNS, type Transaction } from "@/lib/finance";

export default async function FinancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const [{ data: profile }, { data: rows }] = await Promise.all([
    supabase.from("profiles").select("onboarded").eq("id", user.id).maybeSingle(),
    supabase
      .from("transactions")
      .select(TRANSACTION_COLUMNS)
      .eq("user_id", user.id)
      .order("occurred_on", { ascending: false }),
  ]);

  if (!profile?.onboarded) redirect("/onboarding");

  // numeric comes back as string — coerce to number.
  const transactions = ((rows ?? []) as Transaction[]).map((t) => ({
    ...t,
    amount: Number(t.amount),
  }));

  const today = new Date()
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  return (
    <PageShell active="FINANCE">
      <FinanceBoard transactions={transactions} today={today} />
    </PageShell>
  );
}
