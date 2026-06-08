"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { C, HEAD, BODY } from "@/app/_components/theme";
import {
  STATUSES,
  STATUS_LABELS,
  countsByStatus,
  daysUntil,
  type Application,
  type Status,
} from "@/lib/career";
import {
  createApplication,
  updateApplication,
  deleteApplication,
} from "@/app/actions/career";

export default function CareerBoard({
  applications,
  today,
}: {
  applications: Application[];
  today: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<null | { mode: "create" } | { mode: "edit"; app: Application }>(null);

  const counts = countsByStatus(applications);
  const maxCount = Math.max(1, ...STATUSES.map((s) => counts[s]));

  const followUps = applications
    .filter((a) => a.follow_up_on)
    .sort((a, b) => (a.follow_up_on! < b.follow_up_on! ? -1 : 1))
    .slice(0, 4);

  function close() {
    setModal(null);
  }

  function handleCreate(input: Parameters<typeof createApplication>[0]) {
    setError(null);
    startTransition(async () => {
      const res = await createApplication(input);
      if ("error" in res) return setError(res.error);
      close();
      router.refresh();
    });
  }

  function handleUpdate(id: string, patch: Parameters<typeof updateApplication>[1]) {
    setError(null);
    startTransition(async () => {
      const res = await updateApplication(id, patch);
      if (res?.error) return setError(res.error);
      close();
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await deleteApplication(id);
      if (res?.error) return setError(res.error);
      close();
      router.refresh();
    });
  }

  return (
    <>
      <header className="flex items-start justify-between">
        <div>
          <h1 style={{ fontFamily: HEAD, fontSize: "2.1rem", letterSpacing: "0.02em", color: C.cream, lineHeight: 1 }}>
            CAREER PIPELINE
          </h1>
          <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.muted, marginTop: 6 }}>
            Track applications, interviews, outreach and follow-ups like a personal CRM.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p style={{ fontFamily: BODY, fontSize: "0.58rem", letterSpacing: "0.22em", color: C.faint }}>DATE</p>
            <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.goldText, marginTop: 2 }}>{today}</p>
          </div>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="rounded-sm px-5 py-3"
            style={{ fontFamily: BODY, fontSize: "0.72rem", letterSpacing: "0.16em", color: C.cream, border: `1px solid ${C.gold}`, background: "rgba(181,144,90,0.08)" }}
          >
            LOG APPLICATION
          </button>
        </div>
      </header>

      {error && <p className="mt-3" style={{ fontFamily: BODY, fontSize: "0.74rem", color: "#E5896A" }}>{error}</p>}

      <div className="mt-6 flex min-h-0 flex-1 flex-col gap-5">
        {/* Pipeline columns */}
        <div className="grid grid-cols-5 gap-3">
          {STATUSES.map((s) => {
            const items = applications.filter((a) => a.status === s);
            return (
              <div key={s} className="flex flex-col rounded-sm px-3 py-3" style={{ border: `1px solid ${C.border}`, background: C.panel, minHeight: 170 }}>
                <div className="mb-2 flex items-center justify-between">
                  <p style={{ fontFamily: HEAD, fontSize: "0.7rem", letterSpacing: "0.06em", color: C.cream }}>{STATUS_LABELS[s]}</p>
                  <span style={{ fontFamily: HEAD, fontSize: "0.85rem", color: C.goldText }}>{counts[s]}</span>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  {items.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setModal({ mode: "edit", app: a })}
                      className="w-full rounded-sm px-3 py-2 text-left"
                      style={{ border: `1px solid ${C.borderSoft}`, background: "rgba(22,17,12,0.6)" }}
                    >
                      <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.cream }}>{a.title}</p>
                      {a.company && <p style={{ fontFamily: BODY, fontSize: "0.62rem", color: C.muted, marginTop: 1 }}>{a.company}</p>}
                    </button>
                  ))}
                  {items.length === 0 && <p style={{ fontFamily: BODY, fontSize: "0.62rem", color: C.faint }}>—</p>}
                </div>
                <button className="mt-2 w-full rounded-sm py-1.5" style={{ fontFamily: BODY, fontSize: "0.55rem", letterSpacing: "0.12em", color: C.goldText, border: `1px solid ${C.border}` }}>SEE MORE ⌄</button>
              </div>
            );
          })}
        </div>

        {/* Follow-ups + Conversions */}
        <div className="flex gap-5">
          <div className="flex-1 rounded-sm px-5 py-4" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
            <p style={{ fontFamily: HEAD, fontSize: "0.8rem", letterSpacing: "0.06em", color: C.cream }}>FOLLOW-UPS</p>
            <div className="mt-3 flex flex-col gap-2">
              {followUps.length === 0 && <p style={{ fontFamily: BODY, fontSize: "0.74rem", color: C.faint }}>No follow-ups scheduled.</p>}
              {followUps.map((a) => {
                const d = daysUntil(a.follow_up_on);
                return (
                  <div key={a.id} className="flex items-center justify-between">
                    <span style={{ fontFamily: BODY, fontSize: "0.82rem", color: C.cream }}>{a.title}</span>
                    <span style={{ fontFamily: HEAD, fontSize: "1.05rem", color: d !== null && d < 0 ? "#E5896A" : C.goldText }}>
                      {d === null ? "—" : `${d} DAYS`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 rounded-sm px-5 py-4" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
            <p style={{ fontFamily: HEAD, fontSize: "0.8rem", letterSpacing: "0.06em", color: C.cream }}>CONVERSIONS</p>
            <div className="mt-3 flex flex-col gap-3">
              {(["applied", "interview", "accepted", "rejected"] as Status[]).map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <span style={{ fontFamily: HEAD, fontSize: "0.92rem", color: C.cream, width: 104 }}>
                    {s === "rejected" ? "DECLINED" : STATUS_LABELS[s]}
                  </span>
                  <div className="relative h-[16px] flex-1 rounded-full" style={{ background: "rgba(181,144,90,0.14)" }}>
                    <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${(counts[s] / maxCount) * 100}%`, background: C.gold }} />
                  </div>
                  <span style={{ fontFamily: HEAD, fontSize: "0.92rem", color: C.goldText, width: 22, textAlign: "right" }}>{counts[s]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emails */}
        <div className="flex min-h-0 flex-1 flex-col rounded-sm px-5 py-4" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
          <p style={{ fontFamily: HEAD, fontSize: "0.8rem", letterSpacing: "0.06em", color: C.cream }}>EMAILS</p>
          <p className="mt-2" style={{ fontFamily: BODY, fontSize: "0.74rem", color: C.faint }}>No outreach logged yet — email & outreach logging coming soon.</p>
        </div>
      </div>

      {modal && (
        <ApplicationModal
          initial={modal.mode === "edit" ? modal.app : null}
          pending={pending}
          onClose={close}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}

/* ─────────────────────────── Modal ─────────────────────────── */

function ApplicationModal({
  initial,
  pending,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: {
  initial: Application | null;
  pending: boolean;
  onClose: () => void;
  onCreate: (input: { title: string; company: string; status: Status; applied_on: string; follow_up_on: string; notes: string }) => void;
  onUpdate: (id: string, patch: { title: string; company: string; status: Status; applied_on: string; follow_up_on: string; notes: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [status, setStatus] = useState<Status>(initial?.status ?? "planned");
  const [appliedOn, setAppliedOn] = useState(initial?.applied_on ?? "");
  const [followUpOn, setFollowUpOn] = useState(initial?.follow_up_on ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const payload = { title, company, status, applied_on: appliedOn, follow_up_on: followUpOn, notes };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-sm px-6 py-5" style={{ border: `1px solid ${C.gold}`, background: "#1a1410" }} onClick={(e) => e.stopPropagation()}>
        <p style={{ fontFamily: HEAD, fontSize: "1rem", letterSpacing: "0.04em", color: C.cream }}>
          {initial ? "EDIT APPLICATION" : "LOG APPLICATION"}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Role / title" className="rounded-sm px-3 py-2 text-sm" style={field()} />
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company (optional)" className="rounded-sm px-3 py-2 text-sm" style={field()} />
          <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="rounded-sm px-3 py-2 text-sm" style={field()}>
            {STATUSES.map((s) => (
              <option key={s} value={s} style={{ background: "#1a1410" }}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <label className="flex-1" style={lbl()}>APPLIED
              <input type="date" value={appliedOn} onChange={(e) => setAppliedOn(e.target.value)} className="mt-1 w-full rounded-sm px-3 py-2 text-sm" style={field()} />
            </label>
            <label className="flex-1" style={lbl()}>FOLLOW-UP
              <input type="date" value={followUpOn} onChange={(e) => setFollowUpOn(e.target.value)} className="mt-1 w-full rounded-sm px-3 py-2 text-sm" style={field()} />
            </label>
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className="rounded-sm px-3 py-2 text-sm" style={{ ...field(), resize: "none", minHeight: 60 }} />
        </div>

        <div className="mt-4 flex items-center justify-between">
          {initial ? (
            <button onClick={() => onDelete(initial.id)} disabled={pending} className="rounded-sm px-4 py-2" style={{ fontFamily: BODY, fontSize: "0.66rem", letterSpacing: "0.14em", color: "#E5896A", border: "1px solid rgba(229,137,106,0.4)" }}>DELETE</button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-sm px-4 py-2" style={{ fontFamily: BODY, fontSize: "0.66rem", letterSpacing: "0.14em", color: C.muted, border: `1px solid ${C.border}` }}>CANCEL</button>
            <button
              onClick={() => (initial ? onUpdate(initial.id, payload) : onCreate(payload))}
              disabled={pending || !title.trim()}
              className="rounded-sm px-5 py-2"
              style={{ fontFamily: BODY, fontSize: "0.66rem", letterSpacing: "0.14em", color: "#191919", background: C.gold, opacity: pending || !title.trim() ? 0.5 : 1, cursor: pending || !title.trim() ? "not-allowed" : "pointer" }}
            >
              {initial ? "SAVE" : "CREATE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function field(): React.CSSProperties {
  return { fontFamily: BODY, background: "rgba(255,255,240,0.06)", color: C.cream, border: `1px solid ${C.border}`, outline: "none" };
}
function lbl(): React.CSSProperties {
  return { fontFamily: BODY, fontSize: "0.56rem", letterSpacing: "0.14em", color: C.faint };
}
