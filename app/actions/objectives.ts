"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Subtask } from "@/lib/objectives";

async function auth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createObjective(input: {
  title: string;
  category?: string | null;
  due_date?: string | null;
}): Promise<{ id: string } | { error: string }> {
  const { supabase, user } = await auth();
  if (!user) return { error: "Not authenticated." };

  const title = input.title.trim();
  if (!title) return { error: "Title is required." };
  const category = input.category?.trim() || null;

  const { data, error } = await supabase
    .from("objectives")
    .insert({
      user_id: user.id,
      title,
      category,
      topic: category ? category.toUpperCase() : null,
      due_date: input.due_date || null,
      subtasks: [],
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/objectives");
  return { id: data.id };
}

export async function updateObjective(
  id: string,
  patch: {
    title?: string;
    category?: string | null;
    due_date?: string | null;
    linked_node?: string | null;
    subtasks?: Subtask[];
  },
): Promise<{ error: string } | void> {
  const { supabase, user } = await auth();
  if (!user) return { error: "Not authenticated." };

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.title !== undefined) update.title = patch.title.trim();
  if (patch.category !== undefined) {
    const c = patch.category?.trim() || null;
    update.category = c;
    update.topic = c ? c.toUpperCase() : null;
  }
  if (patch.due_date !== undefined) update.due_date = patch.due_date || null;
  if (patch.linked_node !== undefined)
    update.linked_node = patch.linked_node?.trim() || null;
  if (patch.subtasks !== undefined) update.subtasks = patch.subtasks;

  const { error } = await supabase
    .from("objectives")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/objectives");
}

export async function deleteObjective(id: string): Promise<{ error: string } | void> {
  const { supabase, user } = await auth();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("objectives")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/objectives");
}
