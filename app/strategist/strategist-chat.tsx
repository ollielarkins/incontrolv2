"use client";

import { useEffect, useState, useTransition } from "react";
import { C, HEAD, BODY } from "@/app/_components/theme";
import Star from "@/app/_components/star";
import { askStrategist, type ChatMessage } from "@/app/actions/strategist";
import { STRATEGIST_MODELS } from "@/app/strategist/models";

const KEY_STORAGE = "incontrol_anthropic_key";
const MODEL_STORAGE = "incontrol_strategist_model";

const SUGGESTIONS = [
  "Review my week, what should I focus on?",
  "What is blocking my top objective?",
  "Where am I overspending this month?",
  "What is the next skill I should pick up?",
];

export default function StrategistChat({ today }: { today: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Bring-your-own Anthropic key + model, persisted in the browser only.
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState<string>(STRATEGIST_MODELS[0].id);
  const [showSettings, setShowSettings] = useState(false);

  // Hydrate the saved key/model from the browser after mount. localStorage isn't
  // available during SSR, so this can't be a lazy initial state.
  useEffect(() => {
    const k = localStorage.getItem(KEY_STORAGE);
    const m = localStorage.getItem(MODEL_STORAGE);
    /* eslint-disable react-hooks/set-state-in-effect */
    if (k) setApiKey(k);
    if (m) setModel(m);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function saveKey(value: string) {
    setApiKey(value);
    if (value.trim()) localStorage.setItem(KEY_STORAGE, value.trim());
    else localStorage.removeItem(KEY_STORAGE);
  }

  function saveModel(value: string) {
    setModel(value);
    localStorage.setItem(MODEL_STORAGE, value);
  }

  function send(text: string) {
    const q = text.trim();
    if (!q || pending) return;
    if (!apiKey.trim()) {
      setError("Add your Anthropic API key first — click the key icon, top right.");
      setShowSettings(true);
      return;
    }
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    startTransition(async () => {
      const res = await askStrategist(next, { apiKey: apiKey.trim(), model });
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setMessages([...next, { role: "assistant", content: res.text }]);
    });
  }

  return (
    <>
      <header className="relative flex items-start justify-between">
        <div>
          <h1 style={{ fontFamily: HEAD, fontSize: "2.1rem", letterSpacing: "0.02em", color: C.cream, lineHeight: 1 }}>
            INCONTROL STRATEGIST
          </h1>
          <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.muted, marginTop: 6 }}>
            Context-aware advisor with read access to your roadmap, objectives, finance and career data.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p style={{ fontFamily: BODY, fontSize: "0.58rem", letterSpacing: "0.22em", color: C.faint }}>DATE</p>
            <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.goldText, marginTop: 2 }}>{today}</p>
          </div>
          <button
            onClick={() => setShowSettings((s) => !s)}
            title="API key & model"
            className="flex items-center gap-2 rounded-sm px-4 py-3"
            style={{ fontFamily: BODY, fontSize: "0.72rem", letterSpacing: "0.16em", color: C.cream, border: `1px solid ${C.gold}`, background: "rgba(181,144,90,0.08)" }}
          >
            <KeyIcon />
            MODEL
            <span
              title={apiKey ? "API key set" : "No API key yet"}
              style={{ width: 7, height: 7, borderRadius: 9999, background: apiKey ? "#7FB069" : "#E5896A" }}
            />
          </button>
          <button onClick={() => { setMessages([]); setError(null); }} className="rounded-sm px-5 py-3" style={{ fontFamily: BODY, fontSize: "0.72rem", letterSpacing: "0.16em", color: C.cream, border: `1px solid ${C.gold}`, background: "rgba(181,144,90,0.08)" }}>
            NEW CHAT
          </button>
        </div>

        {showSettings && (
          <div
            className="absolute right-0 z-20 mt-2 w-[360px] rounded-sm p-5"
            style={{ top: "100%", border: `1px solid ${C.gold}`, background: C.panelSolid, boxShadow: "0 12px 40px rgba(0,0,0,0.55)" }}
          >
            <p style={{ fontFamily: HEAD, fontSize: "1rem", letterSpacing: "0.06em", color: C.cream }}>STRATEGIST MODEL</p>
            <p style={{ fontFamily: BODY, fontSize: "0.72rem", color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
              Bring your own Anthropic API key and pick your favourite Claude model. Your key stays in this browser and is never saved to your account.
            </p>

            <label style={{ fontFamily: BODY, fontSize: "0.6rem", letterSpacing: "0.2em", color: C.faint, display: "block", marginTop: 16 }}>
              ANTHROPIC API KEY
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => saveKey(e.target.value)}
              placeholder="sk-ant-…"
              autoComplete="off"
              spellCheck={false}
              className="mt-1.5 w-full rounded-sm px-3 py-2.5 outline-none"
              style={{ fontFamily: BODY, fontSize: "0.82rem", color: C.cream, background: "rgba(255,255,240,0.05)", border: `1px solid ${C.border}` }}
            />
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: BODY, fontSize: "0.66rem", color: C.goldText, marginTop: 6, display: "inline-block" }}
            >
              Get a key from console.anthropic.com →
            </a>

            <label style={{ fontFamily: BODY, fontSize: "0.6rem", letterSpacing: "0.2em", color: C.faint, display: "block", marginTop: 16 }}>
              MODEL
            </label>
            <select
              value={model}
              onChange={(e) => saveModel(e.target.value)}
              className="mt-1.5 w-full rounded-sm px-3 py-2.5 outline-none"
              style={{ fontFamily: BODY, fontSize: "0.82rem", color: C.cream, background: C.panelSolid, border: `1px solid ${C.border}` }}
            >
              {STRATEGIST_MODELS.map((m) => (
                <option key={m.id} value={m.id} style={{ background: C.panelSolid, color: C.cream }}>
                  {m.label}
                </option>
              ))}
            </select>

            <div className="mt-5 flex justify-end gap-3">
              {apiKey && (
                <button
                  onClick={() => saveKey("")}
                  className="rounded-sm px-4 py-2"
                  style={{ fontFamily: BODY, fontSize: "0.66rem", letterSpacing: "0.14em", color: C.muted, border: `1px solid ${C.border}` }}
                >
                  CLEAR KEY
                </button>
              )}
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-sm px-5 py-2"
                style={{ fontFamily: BODY, fontSize: "0.66rem", letterSpacing: "0.14em", color: C.cream, border: `1px solid ${C.gold}`, background: "rgba(181,144,90,0.12)" }}
              >
                DONE
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="mt-5 flex min-h-0 flex-1 flex-col rounded-sm" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
        {/* Transcript / empty state */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <Star size={66} />
              <p className="mt-6" style={{ fontFamily: BODY, fontStyle: "italic", fontSize: "1.6rem", color: "#E8DCC4" }}>
                ask anything about your operation.
              </p>
              <div className="mt-8 flex w-full max-w-xl flex-col gap-3">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} disabled={pending} className="w-full rounded-sm px-5 py-3.5 text-center transition-colors hover:bg-[rgba(181,144,90,0.1)]" style={{ fontFamily: BODY, fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.08em", color: C.cream, border: `1px solid ${C.border}`, background: "rgba(22,17,12,0.5)" }}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "self-end" : "self-start"} style={{ maxWidth: "85%" }}>
                  <p style={{ fontFamily: BODY, fontSize: "0.58rem", letterSpacing: "0.18em", color: C.faint, marginBottom: 4, textAlign: m.role === "user" ? "right" : "left" }}>
                    {m.role === "user" ? "YOU" : "STRATEGIST"}
                  </p>
                  <div className="rounded-sm px-4 py-3" style={{ border: `1px solid ${m.role === "user" ? C.border : "rgba(181,144,90,0.4)"}`, background: m.role === "user" ? "rgba(255,255,240,0.04)" : "rgba(181,144,90,0.08)" }}>
                    <p style={{ fontFamily: BODY, fontSize: "0.86rem", color: C.cream, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.content}</p>
                  </div>
                </div>
              ))}
              {pending && (
                <div className="self-start">
                  <p style={{ fontFamily: BODY, fontSize: "0.58rem", letterSpacing: "0.18em", color: C.faint, marginBottom: 4 }}>STRATEGIST</p>
                  <div className="rounded-sm px-4 py-3" style={{ border: "1px solid rgba(181,144,90,0.4)", background: "rgba(181,144,90,0.08)" }}>
                    <p style={{ fontFamily: BODY, fontSize: "0.86rem", color: C.muted }}>Thinking…</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && <p className="px-8 pb-2" style={{ fontFamily: BODY, fontSize: "0.74rem", color: "#E5896A" }}>{error}</p>}

        {/* Composer */}
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
            placeholder="ASK THE STRATEGIST…"
            disabled={pending}
            className="flex-1 bg-transparent outline-none"
            style={{ fontFamily: HEAD, fontSize: "1.1rem", letterSpacing: "0.04em", color: C.cream }}
          />
          <button onClick={() => send(input)} disabled={pending || !input.trim()} className="rounded-sm px-5 py-2" style={{ fontFamily: BODY, fontSize: "0.72rem", letterSpacing: "0.16em", color: C.cream, border: `1px solid ${C.gold}`, opacity: pending || !input.trim() ? 0.5 : 1, cursor: pending || !input.trim() ? "not-allowed" : "pointer" }}>
            SEND
          </button>
        </div>
      </div>
    </>
  );
}

function KeyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M10.7 12.3 19 4" />
      <path d="m16 7 3 3" />
      <path d="m14 9 2 2" />
    </svg>
  );
}
