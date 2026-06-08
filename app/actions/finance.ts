"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TxKind } from "@/lib/finance";

async function auth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

type TxInput = {
  kind: TxKind;
  amount: number;
  category?: string | null;
  description?: string | null;
  occurred_on?: string | null;
  recurring?: boolean;
};

export async function createTransaction(
  input: TxInput,
): Promise<{ id: string } | { error: string }> {
  const { supabase, user } = await auth();
  if (!user) return { error: "Not authenticated." };
  if (!(input.amount > 0)) return { error: "Amount must be greater than 0." };

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      kind: input.kind,
      amount: input.amount,
      category: input.category?.trim() || null,
      description: input.description?.trim() || null,
      occurred_on: input.occurred_on || new Date().toISOString().slice(0, 10),
      recurring: input.recurring ?? false,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return { id: data.id };
}

export async function deleteTransaction(id: string): Promise<{ error: string } | void> {
  const { supabase, user } = await auth();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}
