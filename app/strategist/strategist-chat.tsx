"use client";

import { useState, useTransition } from "react";
import { C, HEAD, BODY } from "@/app/_components/theme";
import Star from "@/app/_components/star";
import { askStrategist, type ChatMessage } from "@/app/actions/strategist";

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

  function send(text: string) {
    const q = text.trim();
    if (!q || pending) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    startTransition(async () => {
      const res = await askStrategist(next);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setMessages([...next, { role: "assistant", content: res.text }]);
    });
  }

  return (
    <>
      <header className="flex items-start justify-between">
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
          <button onClick={() => { setMessages([]); setError(null); }} className="rounded-sm px-5 py-3" style={{ fontFamily: BODY, fontSize: "0.72rem", letterSpacing: "0.16em", color: C.cream, border: `1px solid ${C.gold}`, background: "rgba(181,144,90,0.08)" }}>
            NEW CHAT
          </button>
        </div>
      </header>

      <div className="mt-5 flex min-h-0 flex-1 flex-col rounded-sm" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
        {/* Transcript / empty state */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <Star size={58} />
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
