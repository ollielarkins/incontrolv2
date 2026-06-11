// Claude models the user can pick from in the strategist settings. The first is
// the default. Shared by the server action and the client UI — kept out of the
// "use server" file so the runtime array can be exported safely.

export const STRATEGIST_MODELS = [
  { id: "claude-opus-4-8", label: "Claude Opus 4.8 — most capable" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 — balanced" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 — fastest" },
] as const;

export const MODEL_IDS = new Set<string>(STRATEGIST_MODELS.map((m) => m.id));
export const DEFAULT_MODEL = STRATEGIST_MODELS[0].id;
