"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { C, HEAD, BODY } from "@/app/_components/theme";
import {
  progressOf,
  daysUntil,
  type Objective,
  type Subtask,
} from "@/lib/objectives";
import {
  createObjective,
  updateObjective,
  deleteObjective,
} from "@/app/actions/objectives";

export default function ObjectivesBoard({
  objectives,
  today,
}: {
  objectives: Objective[];
  today: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(objectives[0]?.id ?? null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");

  const selected =
    objectives.find((o) => o.id === selectedId) ?? objectives[0] ?? null;

  /* ── mutations ── */

  function handleCreate(input: { title: string; category: string; due_date: string }) {
    setError(null);
    startTransition(async () => {
      const res = await createObjective(input);
      if ("error" in res) return setError(res.error);
      setSelectedId(res.id);
      setCreating(false);
      router.refresh();
    });
  }

  function saveSubtasks(subtasks: Subtask[]) {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await updateObjective(selected.id, { subtasks });
      if (res?.error) return setError(res.error);
      router.refresh();
    });
  }

  function handleEdit(patch: Parameters<typeof updateObjective>[1]) {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await updateObjective(selected.id, patch);
      if (res?.error) return setError(res.error);
      setEditing(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteObjective(selected.id);
      if (res?.error) return setError(res.error);
      setSelectedId(null);
      setEditing(false);
      router.refresh();
    });
  }

  function addSubtask() {
    const text = newSubtask.trim();
    if (!text || !selected) return;
    saveSubtasks([...selected.subtasks, { id: crypto.randomUUID(), text, done: false }]);
    setNewSubtask("");
  }

  return (
    <>
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 style={{ fontFamily: HEAD, fontSize: "2.1rem", letterSpacing: "0.02em", color: C.cream, lineHeight: 1 }}>
            SMART OBJECTIVES
          </h1>
          <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.muted, marginTop: 6 }}>
            Specific, measurable, achievable, relevant, time-bound — all broken into subtasks.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p style={{ fontFamily: BODY, fontSize: "0.58rem", letterSpacing: "0.22em", color: C.faint }}>DATE</p>
            <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.goldText, marginTop: 2 }}>{today}</p>
          </div>
          <button
            onClick={() => { setCreating((v) => !v); setEditing(false); }}
            disabled={pending}
            className="rounded-sm px-5 py-3"
            style={{ fontFamily: BODY, fontSize: "0.72rem", letterSpacing: "0.16em", color: C.cream, border: `1px solid ${C.gold}`, background: "rgba(181,144,90,0.08)" }}
          >
            NEW OBJECTIVE
          </button>
        </div>
      </header>

      {error && (
        <p className="mt-3" style={{ fontFamily: BODY, fontSize: "0.74rem", color: "#E5896A" }}>{error}</p>
      )}

      {/* Two columns */}
      <div className="mt-6 flex min-h-0 flex-1 gap-6">
        {/* ALL OBJECTIVES */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-3 flex items-center justify-between">
            <p style={{ fontFamily: BODY, fontSize: "0.66rem", letterSpacing: "0.22em", color: C.cream }}>ALL OBJECTIVES</p>
            <Pill onClick={() => undefined}>EDIT</Pill>
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-sm" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {creating && (
                <CreateForm pending={pending} onCancel={() => setCreating(false)} onCreate={handleCreate} />
              )}
              {objectives.length === 0 && !creating ? (
                <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.faint }}>No objectives yet — hit NEW OBJECTIVE to create one.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {objectives.map((o) => (
                    <ObjectiveCard
                      key={o.id}
                      objective={o}
                      selected={o.id === selected?.id}
                      onClick={() => { setSelectedId(o.id); setEditing(false); }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="p-3" style={{ borderTop: `1px solid ${C.border}` }}>
              <button className="w-full rounded-sm py-2" style={{ fontFamily: BODY, fontSize: "0.7rem", letterSpacing: "0.16em", color: C.goldText, border: `1px solid ${C.border}`, background: "rgba(22,17,12,0.5)" }}>SEE MORE ⌄</button>
            </div>
          </div>
        </div>

        {/* DETAILS */}
        <div className="flex min-h-0 flex-col" style={{ width: 430 }}>
          <p className="mb-3" style={{ fontFamily: BODY, fontSize: "0.66rem", letterSpacing: "0.22em", color: C.cream }}>DETAILS</p>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {!selected ? (
              <EmptyState text="Select an objective to see its details." />
            ) : editing ? (
              <EditForm objective={selected} pending={pending} onCancel={() => setEditing(false)} onSave={handleEdit} onDelete={handleDelete} />
            ) : (
              <Details
                objective={selected}
                newSubtask={newSubtask}
                setNewSubtask={setNewSubtask}
                onAddSubtask={addSubtask}
                onToggleSubtask={(id) =>
                  saveSubtasks(selected.subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)))
                }
                onDeleteSubtask={(id) =>
                  saveSubtasks(selected.subtasks.filter((s) => s.id !== id))
                }
                onEdit={() => setEditing(true)}
                pending={pending}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────── Details ─────────────────────────── */

function Details({
  objective,
  newSubtask,
  setNewSubtask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onEdit,
  pending,
}: {
  objective: Objective;
  newSubtask: string;
  setNewSubtask: (v: string) => void;
  onAddSubtask: () => void;
  onToggleSubtask: (id: string) => void;
  onDeleteSubtask: (id: string) => void;
  onEdit: () => void;
  pending: boolean;
}) {
  const pct = progressOf(objective.subtasks);
  const done = objective.subtasks.filter((s) => s.done).length;
  const days = daysUntil(objective.due_date);

  return (
    <div className="h-full rounded-sm px-6 py-5" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
      <div className="flex items-start justify-between">
        <div>
          <p style={{ fontFamily: BODY, fontSize: "0.6rem", letterSpacing: "0.2em", color: C.faint }}>
            {objective.topic ?? "OBJECTIVE"}
          </p>
          <p style={{ fontFamily: HEAD, fontSize: "1.7rem", color: C.cream, lineHeight: 1.05, marginTop: 2 }}>
            {objective.title}
          </p>
        </div>
        <Pill onClick={onEdit}>EDIT</Pill>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Field label="DUE" value={objective.due_date ? `${days}d` : "—"} />
        <Field label="CATEGORY" value={objective.category ?? "—"} />
        <Field label="LINKED NODE" value={objective.linked_node ?? "—"} />
      </div>

      <p className="mt-6" style={{ fontFamily: HEAD, fontSize: "1.9rem", color: C.goldText, letterSpacing: "0.02em" }}>
        {pct}% COMPLETED
      </p>

      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <p style={{ fontFamily: BODY, fontSize: "0.62rem", letterSpacing: "0.2em", color: C.cream }}>SUBTASKS</p>
          <p style={{ fontFamily: HEAD, fontSize: "0.95rem", color: C.goldText }}>{done}/{objective.subtasks.length}</p>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {objective.subtasks.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-sm px-3 py-2" style={{ border: `1px solid ${C.border}`, background: "rgba(22,17,12,0.5)" }}>
              <button
                onClick={() => onToggleSubtask(s.id)}
                disabled={pending}
                style={{ width: 16, height: 16, borderRadius: 2, border: `1px solid ${C.gold}`, background: s.done ? C.gold : "transparent", flexShrink: 0 }}
                aria-label="toggle"
              />
              <span style={{ fontFamily: BODY, fontSize: "0.78rem", color: s.done ? C.faint : C.cream, textDecoration: s.done ? "line-through" : "none", flex: 1 }}>
                {s.text}
              </span>
              <button onClick={() => onDeleteSubtask(s.id)} disabled={pending} style={{ fontFamily: BODY, fontSize: "0.8rem", color: C.faint }} aria-label="delete">×</button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onAddSubtask(); }}
            placeholder="Add a subtask…"
            className="flex-1 rounded-sm px-3 py-2 text-sm"
            style={fieldStyle()}
          />
          <button onClick={onAddSubtask} disabled={pending} className="rounded-sm px-4" style={{ fontFamily: BODY, fontSize: "0.7rem", letterSpacing: "0.12em", color: "#191919", background: C.gold }}>
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Forms ─────────────────────────── */

function CreateForm({
  pending,
  onCancel,
  onCreate,
}: {
  pending: boolean;
  onCancel: () => void;
  onCreate: (input: { title: string; category: string; due_date: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [due, setDue] = useState("");
  return (
    <div className="mb-3 rounded-sm px-5 py-4" style={{ border: `1px solid ${C.gold}`, background: C.panel }}>
      <Label>NEW OBJECTIVE</Label>
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Objective title" className="mt-2 w-full rounded-sm px-3 py-2 text-sm" style={fieldStyle()} />
      <div className="mt-2 flex gap-2">
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (optional)" className="flex-1 rounded-sm px-3 py-2 text-sm" style={fieldStyle()} />
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="rounded-sm px-3 py-2 text-sm" style={fieldStyle()} />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <GhostBtn onClick={onCancel}>CANCEL</GhostBtn>
        <GoldBtn onClick={() => onCreate({ title, category, due_date: due })} disabled={pending || !title.trim()}>CREATE</GoldBtn>
      </div>
    </div>
  );
}

function EditForm({
  objective,
  pending,
  onCancel,
  onSave,
  onDelete,
}: {
  objective: Objective;
  pending: boolean;
  onCancel: () => void;
  onSave: (patch: { title: string; category: string; due_date: string; linked_node: string }) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(objective.title);
  const [category, setCategory] = useState(objective.category ?? "");
  const [due, setDue] = useState(objective.due_date ?? "");
  const [node, setNode] = useState(objective.linked_node ?? "");
  return (
    <div className="h-full rounded-sm px-6 py-5" style={{ border: `1px solid ${C.gold}`, background: C.panel }}>
      <Label>EDIT OBJECTIVE</Label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="mt-2 w-full rounded-sm px-3 py-2 text-sm" style={fieldStyle()} />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="rounded-sm px-3 py-2 text-sm" style={fieldStyle()} />
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="rounded-sm px-3 py-2 text-sm" style={fieldStyle()} />
      </div>
      <input value={node} onChange={(e) => setNode(e.target.value)} placeholder="Linked node (optional)" className="mt-2 w-full rounded-sm px-3 py-2 text-sm" style={fieldStyle()} />
      <div className="mt-4 flex items-center justify-between">
        <GhostBtn onClick={onDelete} danger>DELETE</GhostBtn>
        <div className="flex gap-2">
          <GhostBtn onClick={onCancel}>CANCEL</GhostBtn>
          <GoldBtn onClick={() => onSave({ title, category, due_date: due, linked_node: node })} disabled={pending || !title.trim()}>SAVE</GoldBtn>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Cards & bits ─────────────────────────── */

function ObjectiveCard({
  objective,
  selected,
  onClick,
}: {
  objective: Objective;
  selected: boolean;
  onClick: () => void;
}) {
  const pct = progressOf(objective.subtasks);
  const days = daysUntil(objective.due_date);
  return (
    <button
      onClick={onClick}
      className="w-full rounded-sm px-5 py-4 text-left transition-colors"
      style={{
        border: selected ? `1px solid ${C.gold}` : `1px solid rgba(181,144,90,0.45)`,
        background: selected ? "rgba(181,144,90,0.1)" : C.panel,
        boxShadow: selected ? `0 0 0 1px ${C.gold} inset` : "none",
      }}
    >
      <div className="flex items-start justify-between">
        <p style={{ fontFamily: BODY, fontSize: "0.6rem", letterSpacing: "0.2em", color: C.goldText }}>{objective.topic ?? "OBJECTIVE"}</p>
        <p style={{ fontFamily: BODY, fontSize: "0.6rem", letterSpacing: "0.16em", color: C.faint }}>{days !== null ? `${days} DAYS` : "—"}</p>
      </div>
      <p style={{ fontFamily: HEAD, fontSize: "1.5rem", color: C.cream, lineHeight: 1.05, marginTop: 2 }}>{objective.title}</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="relative h-[3px] flex-1 rounded" style={{ background: "rgba(181,144,90,0.18)" }}>
          <div className="absolute left-0 top-0 h-full rounded" style={{ width: `${pct}%`, background: C.gold }} />
        </div>
        <span style={{ fontFamily: BODY, fontSize: "0.6rem", color: C.muted }}>{pct}%</span>
      </div>
    </button>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontFamily: BODY, fontSize: "0.56rem", letterSpacing: "0.16em", color: C.faint }}>{label}</p>
      <p style={{ fontFamily: HEAD, fontSize: "1.15rem", color: C.cream, marginTop: 4 }}>{value}</p>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: BODY, fontSize: "0.6rem", letterSpacing: "0.2em", color: C.goldText }}>{children}</p>;
}

function Pill({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="rounded-sm px-4 py-1.5" style={{ fontFamily: BODY, fontSize: "0.64rem", letterSpacing: "0.16em", color: C.cream, border: `1px solid ${C.border}`, background: C.panel }}>
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className="rounded-sm px-4 py-2" style={{ fontFamily: BODY, fontSize: "0.66rem", letterSpacing: "0.14em", color: danger ? "#E5896A" : C.muted, border: `1px solid ${danger ? "rgba(229,137,106,0.4)" : C.border}` }}>
      {children}
    </button>
  );
}

function GoldBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="rounded-sm px-5 py-2" style={{ fontFamily: BODY, fontSize: "0.66rem", letterSpacing: "0.14em", color: "#191919", background: C.gold, opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>
      {children}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="h-full rounded-sm px-5 py-6" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
      <p style={{ fontFamily: BODY, fontSize: "0.74rem", color: C.faint }}>{text}</p>
    </div>
  );
}

function fieldStyle(): React.CSSProperties {
  return {
    fontFamily: BODY,
    background: "rgba(255,255,240,0.06)",
    color: C.cream,
    border: `1px solid ${C.border}`,
    outline: "none",
  };
}
