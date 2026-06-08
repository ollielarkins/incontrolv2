"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Bookmark, ScheduleBlock, Todo } from "@/lib/qol";

async function save(field: string, value: unknown): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("quality_of_life")
    .upsert({ id: user.id, [field]: value, updated_at: new Date().toISOString() });

  if (error) return { error: error.message };
  revalidatePath("/quality-of-life");
}

export async function updateDailyFocus(text: string) {
  return save("daily_focus", text);
}
export async function updateNotes(text: string) {
  return save("notes", text);
}
export async function updateSchedule(schedule: ScheduleBlock[]) {
  return save("schedule", schedule);
}
export async function updateTodos(todos: Todo[]) {
  return save("todos", todos);
}
export async function updateBookmarks(bookmarks: Bookmark[]) {
  return save("bookmarks", bookmarks);
}
