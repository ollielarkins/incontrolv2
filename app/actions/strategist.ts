"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { buildStrategistContext } from "@/lib/strategist-context";
import { MODEL_IDS, DEFAULT_MODEL } from "@/app/strategist/models";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type StrategistOptions = { apiKey?: string; model?: string };

const SYSTEM = `You are the InControl Strategist — a sharp, encouraging personal advisor for a student / young adult.
You have read-only access to a snapshot of the user's objectives, career pipeline, finances and profile (provided below).
Give specific, actionable advice grounded in that data. Reference concrete numbers and items when relevant.
Be concise and direct: a few short paragraphs or a tight bullet list. Don't invent data you weren't given — if something isn't tracked yet, say so and suggest logging it.`;

export async function askStrategist(
  history: ChatMessage[],
  opts: StrategistOptions = {},
): Promise<{ text: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Prefer the user's own key (entered in the strategist settings and kept in
  // their browser); fall back to a server key if one is configured.
  const apiKey = opts.apiKey?.trim() || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      error:
        "Add your Anthropic API key in the strategist settings (the key icon, top right) to start chatting.",
    };
  }

  if (history.length === 0) return { error: "Ask a question first." };

  const model =
    opts.model && MODEL_IDS.has(opts.model) ? opts.model : DEFAULT_MODEL;

  const context = await buildStrategistContext(user.id);
  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model,
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
    const msg = e instanceof Error ? e.message : "Strategist request failed.";
    // A rejected key is the most likely failure when users bring their own.
    if (/401|invalid|authentication|x-api-key/i.test(msg)) {
      return {
        error:
          "Your Anthropic API key was rejected. Check it in the strategist settings (the key icon) and try again.",
      };
    }
    return { error: msg };
  }
}
