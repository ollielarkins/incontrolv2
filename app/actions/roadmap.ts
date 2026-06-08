"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { NodeStatus } from "@/lib/roadmap";

async function auth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createNode(input: {
  title?: string;
  x: number;
  y: number;
}): Promise<{ id: string } | { error: string }> {
  const { supabase, user } = await auth();
  if (!user) return { error: "Not authenticated." };

  const { data, error } = await supabase
    .from("roadmap_nodes")
    .insert({ user_id: user.id, title: input.title?.trim() || "New node", x: input.x, y: input.y, links: [] })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/roadmaps");
  return { id: data.id };
}

export async function updateNode(
  id: string,
  patch: { title?: string; status?: NodeStatus; x?: number; y?: number; links?: string[] },
): Promise<{ error: string } | void> {
  const { supabase, user } = await auth();
  if (!user) return { error: "Not authenticated." };

  const update: Record<string, unknown> = {};
  if (patch.title !== undefined) update.title = patch.title.trim() || "Untitled";
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.x !== undefined) update.x = patch.x;
  if (patch.y !== undefined) update.y = patch.y;
  if (patch.links !== undefined) update.links = patch.links;

  const { error } = await supabase
    .from("roadmap_nodes")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/roadmaps");
}

export async function deleteNode(id: string): Promise<{ error: string } | void> {
  const { supabase, user } = await auth();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("roadmap_nodes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/roadmaps");
}
