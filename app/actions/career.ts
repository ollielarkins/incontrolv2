"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Status } from "@/lib/career";

async function auth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

type AppInput = {
  title: string;
  company?: string | null;
  status?: Status;
  applied_on?: string | null;
  follow_up_on?: string | null;
  notes?: string | null;
};

export async function createApplication(
  input: AppInput,
): Promise<{ id: string } | { error: string }> {
  const { supabase, user } = await auth();
  if (!user) return { error: "Not authenticated." };
  const title = input.title.trim();
  if (!title) return { error: "Title is required." };

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      title,
      company: input.company?.trim() || null,
      status: input.status ?? "planned",
      applied_on: input.applied_on || null,
      follow_up_on: input.follow_up_on || null,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/career");
  revalidatePath("/dashboard");
  return { id: data.id };
}

export async function updateApplication(
  id: string,
  patch: AppInput,
): Promise<{ error: string } | void> {
  const { supabase, user } = await auth();
  if (!user) return { error: "Not authenticated." };

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.title !== undefined) update.title = patch.title.trim();
  if (patch.company !== undefined) update.company = patch.company?.trim() || null;
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.applied_on !== undefined) update.applied_on = patch.applied_on || null;
  if (patch.follow_up_on !== undefined) update.follow_up_on = patch.follow_up_on || null;
  if (patch.notes !== undefined) update.notes = patch.notes?.trim() || null;

  const { error } = await supabase
    .from("applications")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/career");
  revalidatePath("/dashboard");
}

export async function deleteApplication(id: string): Promise<{ error: string } | void> {
  const { supabase, user } = await auth();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/career");
  revalidatePath("/dashboard");
}
