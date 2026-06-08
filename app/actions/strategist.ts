"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { buildStrategistContext } from "@/lib/strategist-context";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM = `You are the InControl Strategist — a sharp, encouraging personal advisor for a student / young adult.
You have read-only access to a snapshot of the user's objectives, career pipeline, finances and profile (provided below).
Give specific, actionable advice grounded in that data. Reference concrete numbers and items when relevant.
Be concise and direct: a few short paragraphs or a tight bullet list. Don't invent data you weren't given — if something isn't tracked yet, say so and suggest logging it.`;

export async function askStrategist(
  history: ChatMessage[],
): Promise<{ text: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      error:
        "The Strategist needs an ANTHROPIC_API_KEY. Add it to your .env.local and restart the dev server.",
    };
  }

  if (history.length === 0) return { error: "Ask a question first." };

  const context = await buildStrategistContext(user.id);
  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: [
        {
          type: "text",
          text: `${SYSTEM}\n\n# User data snapshot\n${context}`,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });

    const text = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    return { text: text || "(No response.)" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Strategist request failed." };
  }
}
