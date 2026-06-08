"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { C, HEAD, BODY } from "@/app/_components/theme";
import type { Bookmark, Qol, ScheduleBlock, Todo } from "@/lib/qol";
import {
  updateBookmarks,
  updateDailyFocus,
  updateNotes,
  updateSchedule,
  updateTodos,
} from "@/app/actions/qol";

export default function QolBoard({ qol, today }: { qol: Qol; today: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: Promise<{ error: string } | void>) {
    setError(null);
    startTransition(async () => {
      const res = await action;
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <header className="flex items-start justify-between">
        <div>
          <h1 style={{ fontFamily: HEAD, fontSize: "2.1rem", letterSpacing: "0.02em", color: C.cream, lineHeight: 1 }}>
            QUALITY OF LIFE
          </h1>
          <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.muted, marginTop: 6 }}>
            Daily focus, tasks, schedule and personal resources.
          </p>
        </div>
        <div className="text-right">
          <p style={{ fontFamily: BODY, fontSize: "0.58rem", letterSpacing: "0.22em", color: C.faint }}>DATE</p>
          <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.goldText, marginTop: 2 }}>{today}</p>
        </div>
      </header>

      {error && <p className="mt-3" style={{ fontFamily: BODY, fontSize: "0.74rem", color: "#E5896A" }}>{error}</p>}

      <div className="mt-6 flex min-h-0 flex-1 gap-6">
        {/* Left column */}
        <div className="flex min-h-0 flex-col gap-6" style={{ width: 360 }}>
          <Schedule blocks={qol.schedule} pending={pending} onChange={(s) => run(updateSchedule(s))} />
          <Bookmarks bookmarks={qol.bookmarks} pending={pending} onChange={(b) => run(updateBookmarks(b))} />
        </div>

        {/* Right column */}
        <div className="flex min-h-0 flex-1 flex-col gap-6">
          <DailyFocus value={qol.daily_focus} pending={pending} onSave={(t) => run(updateDailyFocus(t))} />
          <div className="flex min-h-0 flex-1 gap-6">
            <Notepad value={qol.notes} pending={pending} onSave={(t) => run(updateNotes(t))} />
            <Todos todos={qol.todos} pending={pending} onChange={(t) => run(updateTodos(t))} />
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────── Panel + buttons ─────────────────────────── */

function Panel({
  title,
  action,
  children,
  minHeight,
  width,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  minHeight?: number;
  width?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col rounded-sm ${className}`} style={{ border: `1px solid ${C.border}`, background: C.panel, minHeight, width }}>
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <p style={{ fontFamily: HEAD, fontSize: "0.82rem", letterSpacing: "0.06em", color: C.cream }}>{title}</p>
        {action}
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5">{children}</div>
    </div>
  );
}

function PillBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-sm px-3 py-1" style={{ fontFamily: BODY, fontSize: "0.62rem", letterSpacing: "0.16em", color: C.cream, border: `1px solid ${C.border}` }}>
      {children}
    </button>
  );
}

function Gold({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="rounded-sm px-4 py-2" style={{ fontFamily: BODY, fontSize: "0.66rem", letterSpacing: "0.14em", color: "#191919", background: C.gold, opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>
      {children}
    </button>
  );
}

function Ghost({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-sm px-4 py-2" style={{ fontFamily: BODY, fontSize: "0.66rem", letterSpacing: "0.14em", color: C.muted, border: `1px solid ${C.border}` }}>
      {children}
    </button>
  );
}

/* ─────────────────────────── Daily Focus ─────────────────────────── */

function DailyFocus({ value, pending, onSave }: { value: string; pending: boolean; onSave: (t: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  return (
    <Panel
      title="DAILY FOCUS"
      minHeight={190}
      className="flex-1"
      action={!editing ? <PillBtn onClick={() => { setText(value); setEditing(true); }}>EDIT</PillBtn> : undefined}
    >
      {editing ? (
        <div className="flex flex-1 flex-col gap-3">
          <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="What's the one thing today?" className="flex-1 rounded-sm px-3 py-2 text-sm" style={{ ...fieldStyle(), resize: "none", minHeight: 90 }} />
          <div className="flex justify-end gap-2">
            <Ghost onClick={() => setEditing(false)}>CANCEL</Ghost>
            <Gold onClick={() => { onSave(text); setEditing(false); }} disabled={pending}>SAVE</Gold>
          </div>
        </div>
      ) : value ? (
        <div className="flex flex-1 items-center">
          <p style={{ fontFamily: HEAD, fontSize: "clamp(2rem, 4.5vw, 4rem)", color: C.cream, lineHeight: 1.05 }}>&ldquo;{value}&rdquo;</p>
        </div>
      ) : (
        <div className="flex flex-1 items-center">
          <p style={{ fontFamily: BODY, fontSize: "0.85rem", color: C.faint }}>Set your focus for the day.</p>
        </div>
      )}
    </Panel>
  );
}

/* ─────────────────────────── Notepad ─────────────────────────── */

function Notepad({ value, pending, onSave }: { value: string; pending: boolean; onSave: (t: string) => void }) {
  const [text, setText] = useState(value);
  return (
    <Panel
      title="NOTEPAD"
      minHeight={240}
      className="flex-1"
      action={<PillBtn onClick={() => { setText(""); onSave(""); }}>CLEAR</PillBtn>}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => { if (text !== value) onSave(text); }}
        disabled={pending}
        placeholder="Start typing…"
        className="flex-1 rounded-sm px-3 py-2 text-sm"
        style={{ ...fieldStyle(), resize: "none", minHeight: 170 }}
      />
    </Panel>
  );
}

/* ─────────────────────────── Todos ─────────────────────────── */

function Todos({ todos, pending, onChange }: { todos: Todo[]; pending: boolean; onChange: (t: Todo[]) => void }) {
  const [text, setText] = useState("");
  function add() {
    const t = text.trim();
    if (!t) return;
    onChange([...todos, { id: crypto.randomUUID(), text: t, done: false }]);
    setText("");
  }
  return (
    <Panel title="TODO LIST" minHeight={240} width={320}>
      <div className="flex flex-1 flex-col gap-2">
        {todos.length === 0 && <p style={{ fontFamily: BODY, fontSize: "0.74rem", color: C.faint }}>No tasks yet.</p>}
        {todos.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-sm px-3 py-2" style={{ border: `1px solid ${C.border}`, background: "rgba(22,17,12,0.5)" }}>
            <button
              onClick={() => onChange(todos.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
              disabled={pending}
              style={{ width: 16, height: 16, borderRadius: 2, border: `1px solid ${C.gold}`, background: t.done ? C.gold : "transparent", flexShrink: 0 }}
              aria-label="toggle"
            />
            <span className="flex-1" style={{ fontFamily: BODY, fontSize: "0.78rem", color: t.done ? C.faint : C.cream, textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
            <button onClick={() => onChange(todos.filter((x) => x.id !== t.id))} disabled={pending} style={{ fontFamily: BODY, color: C.faint }} aria-label="delete">×</button>
          </div>
        ))}
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") add(); }}
        placeholder="New task…"
        className="mt-3 w-full rounded-sm px-3 py-2 text-sm"
        style={fieldStyle()}
      />
      <button onClick={add} disabled={pending} className="mt-2 w-full rounded-sm py-2.5" style={{ fontFamily: BODY, fontSize: "0.72rem", letterSpacing: "0.16em", color: "#191919", background: C.gold }}>
        ADD A TASK
      </button>
    </Panel>
  );
}

/* ─────────────────────────── Bookmarks ─────────────────────────── */

function Bookmarks({ bookmarks, pending, onChange }: { bookmarks: Bookmark[]; pending: boolean; onChange: (b: Bookmark[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  function add() {
    const l = label.trim();
    const u = url.trim();
    if (!l || !u) return;
    const href = /^https?:\/\//.test(u) ? u : `https://${u}`;
    onChange([...bookmarks, { id: crypto.randomUUID(), label: l, url: href }]);
    setLabel(""); setUrl(""); setAdding(false);
  }
  return (
    <Panel title="BOOKMARKS" minHeight={170} action={<PillBtn onClick={() => setAdding((v) => !v)}>ADD</PillBtn>}>
      {adding && (
        <div className="mb-3 flex flex-col gap-2">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="rounded-sm px-3 py-2 text-sm" style={fieldStyle()} />
          <div className="flex gap-2">
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="flex-1 rounded-sm px-3 py-2 text-sm" style={fieldStyle()} />
            <Gold onClick={add} disabled={pending}>ADD</Gold>
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2">
        {bookmarks.length === 0 && !adding && <p style={{ fontFamily: BODY, fontSize: "0.74rem", color: C.faint }}>No bookmarks yet.</p>}
        {bookmarks.map((b) => (
          <div key={b.id} className="flex items-center gap-3 rounded-sm px-3 py-2" style={{ border: `1px solid ${C.border}`, background: "rgba(22,17,12,0.5)" }}>
            <a href={b.url} target="_blank" rel="noreferrer" className="flex-1">
              <p style={{ fontFamily: HEAD, fontSize: "0.95rem", color: C.cream }}>{b.label}</p>
              <p style={{ fontFamily: BODY, fontSize: "0.62rem", letterSpacing: "0.08em", color: C.goldText }}>{b.url.replace(/^https?:\/\//, "")}</p>
            </a>
            <button onClick={() => onChange(bookmarks.filter((x) => x.id !== b.id))} disabled={pending} style={{ fontFamily: BODY, color: C.faint }} aria-label="delete">×</button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ─────────────────────────── Schedule ─────────────────────────── */

function Schedule({ blocks, pending, onChange }: { blocks: ScheduleBlock[]; pending: boolean; onChange: (b: ScheduleBlock[]) => void }) {
  const [editing, setEditing] = useState(false);
  const [time, setTime] = useState("");
  const [topic, setTopic] = useState("");
  const [detail, setDetail] = useState("");
  function add() {
    const tp = topic.trim();
    if (!tp) return;
    onChange([...blocks, { id: crypto.randomUUID(), time: time.trim(), topic: tp, detail: detail.trim() }]);
    setTime(""); setTopic(""); setDetail("");
  }
  return (
    <Panel title="SCHEDULE BLOCK" minHeight={260} className="flex-1" action={<PillBtn onClick={() => setEditing((v) => !v)}>{editing ? "DONE" : "EDIT"}</PillBtn>}>
      <div className="flex flex-1 flex-col gap-3">
        {blocks.length === 0 && !editing && <p style={{ fontFamily: BODY, fontSize: "0.74rem", color: C.faint }}>No schedule blocks yet — tap EDIT to add.</p>}
        {blocks.map((b) => (
          <div key={b.id} className="flex flex-1 items-stretch gap-3 rounded-sm" style={{ border: `1px solid ${C.border}`, background: "rgba(22,17,12,0.5)", minHeight: 56 }}>
            <div className="flex items-center justify-center" style={{ width: 34, borderRight: `1px solid ${C.borderSoft}`, flexShrink: 0 }}>
              <span style={{ fontFamily: HEAD, fontSize: "0.62rem", letterSpacing: "0.06em", color: C.goldText, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{b.time || "—"}</span>
            </div>
            <div className="flex flex-1 flex-col justify-center py-2 pr-2">
              <p style={{ fontFamily: HEAD, fontSize: "0.95rem", color: C.cream }}>{b.topic}</p>
              {b.detail && <p style={{ fontFamily: BODY, fontSize: "0.72rem", color: C.muted, marginTop: 1 }}>{b.detail}</p>}
            </div>
            {editing && <button onClick={() => onChange(blocks.filter((x) => x.id !== b.id))} disabled={pending} className="self-start p-2" style={{ fontFamily: BODY, color: C.faint }} aria-label="delete">×</button>}
          </div>
        ))}
      </div>

      {editing && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="8 AM" className="rounded-sm px-3 py-2 text-sm" style={{ ...fieldStyle(), width: 80 }} />
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" className="flex-1 rounded-sm px-3 py-2 text-sm" style={fieldStyle()} />
          </div>
          <div className="flex gap-2">
            <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Detail (optional)" className="flex-1 rounded-sm px-3 py-2 text-sm" style={fieldStyle()} />
            <Gold onClick={add} disabled={pending}>ADD</Gold>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* ─────────────────────────── shared input style ─────────────────────────── */

function fieldStyle(): React.CSSProperties {
  return {
    fontFamily: BODY,
    background: "rgba(255,255,240,0.06)",
    color: C.cream,
    border: `1px solid ${C.border}`,
    outline: "none",
  };
}
