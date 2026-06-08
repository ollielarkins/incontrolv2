"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { C, HEAD, BODY } from "@/app/_components/theme";
import {
  byCategory,
  gbp,
  monthlyTrend,
  sumBy,
  thisMonthKey,
  type Transaction,
  type TxKind,
} from "@/lib/finance";
import { createTransaction, deleteTransaction } from "@/app/actions/finance";

const GOLD_SHADES = ["#B5905A", "#C8A57D", "#8a6f44", "#d8bd92", "#6f5a38", "#9c7f4e"];

export default function FinanceBoard({
  transactions,
  today,
}: {
  transactions: Transaction[];
  today: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [logging, setLogging] = useState(false);

  const stats = useMemo(() => {
    const key = thisMonthKey();
    const month = transactions.filter((t) => t.occurred_on.slice(0, 7) === key);
    const income = sumBy(month, "income");
    const spend = sumBy(month, "expense");
    const subsMonthly = month
      .filter((t) => t.recurring && t.kind === "expense")
      .reduce((a, t) => a + t.amount, 0);
    return {
      income,
      spend,
      net: income - spend,
      count: month.length,
      subsMonthly,
      spendCats: byCategory(month, "expense"),
      incomeSources: byCategory(month, "income"),
      trend: monthlyTrend(transactions, 6),
    };
  }, [transactions]);

  const recurring = transactions.filter((t) => t.recurring);
  const recent = transactions.slice(0, 8);

  function handleCreate(input: Parameters<typeof createTransaction>[0]) {
    setError(null);
    startTransition(async () => {
      const res = await createTransaction(input);
      if ("error" in res) return setError(res.error);
      setLogging(false);
      router.refresh();
    });
  }
  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await deleteTransaction(id);
      if (res?.error) return setError(res.error);
      router.refresh();
    });
  }

  return (
    <>
      <header className="flex items-start justify-between">
        <div>
          <h1 style={{ fontFamily: HEAD, fontSize: "2.1rem", letterSpacing: "0.02em", color: C.cream, lineHeight: 1 }}>
            FINANCE INTELLIGENCE
          </h1>
          <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.muted, marginTop: 6 }}>
            Categorised cashflow, recurring detection and spending analysis.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p style={{ fontFamily: BODY, fontSize: "0.58rem", letterSpacing: "0.22em", color: C.faint }}>DATE</p>
            <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.goldText, marginTop: 2 }}>{today}</p>
          </div>
          <button onClick={() => setLogging(true)} className="rounded-sm px-5 py-3" style={{ fontFamily: BODY, fontSize: "0.72rem", letterSpacing: "0.16em", color: C.cream, border: `1px solid ${C.gold}`, background: "rgba(181,144,90,0.08)" }}>
            LOG TRANSACTION
          </button>
        </div>
      </header>

      {error && <p className="mt-3" style={{ fontFamily: BODY, fontSize: "0.74rem", color: "#E5896A" }}>{error}</p>}

      {/* Metrics strip */}
      <section className="mt-5 flex items-stretch rounded-sm" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
        <Metric label="INCOME" value={gbp(stats.income)} />
        <VDiv />
        <Metric label="SPEND" value={gbp(stats.spend)} />
        <VDiv />
        <div className="flex flex-1 items-center gap-4 px-5 py-4">
          <div className="min-w-0 flex-1">
            <p style={lbl}>BY CATEGORY</p>
            <CategoryBars cats={stats.spendCats} />
          </div>
          <Donut size={62} segments={stats.spendCats.map((c) => ({ label: c.category, value: c.amount }))} />
        </div>
        <VDiv />
        <Metric label="NET" value={gbp(stats.net)} sub={`${stats.count} TRANSACTIONS`} />
        <VDiv />
        <Metric label="SUBSCRIPTIONS / MO" value={gbp(stats.subsMonthly)} sub={`${gbp(stats.subsMonthly * 12)} / YR`} />
      </section>

      <div className="mt-5 flex min-h-0 flex-1 flex-col gap-5">
        {/* Trend + income sources */}
        <div className="flex gap-5">
          <div className="flex-1 rounded-sm px-5 py-4" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontFamily: HEAD, fontSize: "0.82rem", color: C.cream }}>TREND</p>
                <p style={{ fontFamily: HEAD, fontSize: "0.72rem", color: C.goldText, marginTop: 2 }}>INCOME VS SPEND</p>
              </div>
              <div className="flex gap-4">
                <Legend color={C.gold} label="INCOME" />
                <Legend color="rgba(244,239,229,0.4)" label="SPEND" />
              </div>
            </div>
            <TrendChart points={stats.trend} />
          </div>

          <div className="rounded-sm px-5 py-4" style={{ width: 280, border: `1px solid ${C.border}`, background: C.panel }}>
            <p style={{ fontFamily: HEAD, fontSize: "0.82rem", color: C.cream }}>INCOME SOURCES</p>
            <div className="mt-4 flex items-center gap-4">
              <Donut segments={stats.incomeSources.map((s) => ({ label: s.category, value: s.amount }))} />
              <Legends segments={stats.incomeSources} />
            </div>
          </div>
        </div>

        {/* Signals + Recurring + Is it worth it */}
        <div className="flex gap-5">
          <div className="flex-1 rounded-sm px-5 py-4" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
            <p style={{ fontFamily: HEAD, fontSize: "0.8rem", color: C.cream }}>INSIGHT</p>
            <p style={{ fontFamily: HEAD, fontSize: "0.72rem", color: C.goldText, marginTop: 2 }}>SIGNALS</p>
            <p className="mt-3" style={{ fontFamily: BODY, fontSize: "0.74rem", color: C.faint }}>
              {stats.count === 0 ? "Log transactions to surface spending signals." : `Net this month is ${gbp(stats.net)} across ${stats.count} transactions.`}
            </p>
          </div>

          <div className="flex-1 rounded-sm px-5 py-4" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
            <p style={{ fontFamily: HEAD, fontSize: "0.8rem", color: C.cream }}>RECURRING</p>
            <p style={{ fontFamily: HEAD, fontSize: "0.72rem", color: C.goldText, marginTop: 2 }}>SUBSCRIPTIONS</p>
            <div className="mt-3 flex flex-col gap-2">
              {recurring.length === 0 && <Empty text="No recurring transactions yet." />}
              {recurring.slice(0, 4).map((t) => <TxRow key={t.id} t={t} onDelete={handleDelete} pending={pending} />)}
            </div>
          </div>

          <div className="flex-1 rounded-sm px-5 py-4" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
            <p style={{ fontFamily: HEAD, fontSize: "0.8rem", color: C.cream }}>AI STRATEGIST</p>
            <p style={{ fontFamily: HEAD, fontSize: "0.72rem", color: C.goldText, marginTop: 2 }}>IS IT WORTH IT?</p>
            <div className="mt-3 flex flex-col gap-2">
              <div className="self-start rounded-md px-3 py-2" style={{ background: "rgba(181,144,90,0.16)", maxWidth: "90%" }}>
                <p style={{ fontFamily: BODY, fontSize: "0.74rem", color: C.cream }}>&ldquo;I want to buy X for £Y — is it worth it?&rdquo;</p>
              </div>
              <div className="self-start rounded-md px-3 py-2" style={{ background: "rgba(181,144,90,0.1)", maxWidth: "90%" }}>
                <p style={{ fontFamily: BODY, fontSize: "0.74rem", color: C.goldText }}>That&apos;s ~Z hours of work at your income rate.</p>
              </div>
              <p className="mt-1" style={{ fontFamily: BODY, fontSize: "0.62rem", color: C.faint }}>Ask the full question on the Strategist page.</p>
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="flex min-h-0 flex-1 flex-col rounded-sm px-5 py-4" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
          <p style={{ fontFamily: HEAD, fontSize: "0.82rem", color: C.cream }}>RECENT TRANSACTIONS</p>
          <div className="mt-3 flex flex-col gap-2 overflow-y-auto">
            {recent.length === 0 && <Empty text="No transactions yet — log your first." />}
            {recent.map((t) => <TxRow key={t.id} t={t} onDelete={handleDelete} pending={pending} />)}
          </div>
        </div>
      </div>

      {logging && <LogModal pending={pending} onClose={() => setLogging(false)} onCreate={handleCreate} />}
    </>
  );
}

/* ─────────────────────────── Pieces ─────────────────────────── */

const lbl: React.CSSProperties = { fontFamily: BODY, fontSize: "0.58rem", letterSpacing: "0.18em", color: C.faint };

function VDiv() {
  return <div style={{ width: 1, background: C.border }} />;
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col justify-center px-5 py-4" style={{ minWidth: 150 }}>
      <p style={lbl}>{label}</p>
      <p style={{ fontFamily: HEAD, fontSize: "1.7rem", color: C.goldText, lineHeight: 1.1, marginTop: 4 }}>{value}</p>
      {sub && <p style={{ fontFamily: BODY, fontSize: "0.56rem", letterSpacing: "0.1em", color: C.faint, marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span style={{ width: 9, height: 9, borderRadius: 9999, background: color }} />
      <span style={{ fontFamily: BODY, fontSize: "0.58rem", letterSpacing: "0.14em", color: C.muted }}>{label}</span>
    </span>
  );
}

function CategoryBars({ cats }: { cats: { category: string; amount: number }[] }) {
  if (cats.length === 0) return <p className="mt-2" style={{ fontFamily: BODY, fontSize: "0.7rem", color: C.faint }}>No spending yet.</p>;
  const max = Math.max(1, ...cats.map((c) => c.amount));
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {cats.slice(0, 4).map((c) => (
        <div key={c.category} className="flex items-center gap-2">
          <span style={{ fontFamily: BODY, fontSize: "0.62rem", color: C.muted, width: 96 }} className="truncate">{c.category}</span>
          <div className="relative h-[8px] flex-1 rounded" style={{ background: "rgba(181,144,90,0.14)" }}>
            <div className="absolute left-0 top-0 h-full rounded" style={{ width: `${(c.amount / max) * 100}%`, background: C.gold }} />
          </div>
          <span style={{ fontFamily: BODY, fontSize: "0.6rem", color: C.goldText, width: 50, textAlign: "right" }}>{gbp(c.amount)}</span>
        </div>
      ))}
    </div>
  );
}

function TrendChart({ points }: { points: { label: string; key: string; income: number; spend: number }[] }) {
  const max = Math.max(1, ...points.map((p) => Math.max(p.income, p.spend)));
  const H = 140;
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((f) => Math.round(max * f));
  return (
    <div className="mt-4 flex gap-3 pb-6">
      {/* Y axis */}
      <div className="flex flex-col justify-between" style={{ height: H }}>
        {ticks.map((t, i) => (
          <span key={i} style={{ fontFamily: BODY, fontSize: "0.55rem", color: C.faint, lineHeight: 1 }}>{gbp(t)}</span>
        ))}
      </div>
      {/* Plot */}
      <div className="relative flex flex-1 items-end justify-between gap-3" style={{ height: H }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
          <div key={i} className="absolute left-0 right-0" style={{ bottom: f * H, height: 1, background: "rgba(181,144,90,0.08)" }} />
        ))}
        {points.map((p) => (
          <div key={p.key} className="relative z-10 flex flex-1 flex-col items-center justify-end" style={{ height: H }}>
            <div className="flex items-end gap-1">
              <div style={{ width: 16, height: Math.max(2, (p.income / max) * H), background: C.gold, borderRadius: 2 }} />
              <div style={{ width: 16, height: Math.max(2, (p.spend / max) * H), background: "rgba(244,239,229,0.35)", borderRadius: 2 }} />
            </div>
            <span className="absolute" style={{ bottom: -20, fontFamily: BODY, fontSize: "0.6rem", letterSpacing: "0.08em", color: C.muted }}>{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Donut({ segments, size = 110 }: { segments: { label: string; value: number }[]; size?: number }) {
  const hole = Math.round(size * 0.58);
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) {
    return <div style={{ width: size, height: size, borderRadius: 9999, border: `${Math.round(size * 0.09)}px solid rgba(181,144,90,0.16)` }} />;
  }
  const stops = segments
    .map((s, i) => {
      const before = segments.slice(0, i).reduce((a, x) => a + x.value, 0);
      const start = (before / total) * 360;
      const end = ((before + s.value) / total) * 360;
      return `${GOLD_SHADES[i % GOLD_SHADES.length]} ${start}deg ${end}deg`;
    })
    .join(", ");
  return (
    <div style={{ width: size, height: size, borderRadius: 9999, background: `conic-gradient(${stops})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <div style={{ width: hole, height: hole, borderRadius: 9999, background: "#1a1410" }} />
    </div>
  );
}

function Legends({ segments }: { segments: { category: string; amount: number }[] }) {
  if (segments.length === 0) return <p style={{ fontFamily: BODY, fontSize: "0.7rem", color: C.faint }}>No income yet.</p>;
  return (
    <div className="flex flex-col gap-1.5">
      {segments.slice(0, 5).map((s, i) => (
        <span key={s.category} className="flex items-center gap-2">
          <span style={{ width: 9, height: 9, borderRadius: 2, background: GOLD_SHADES[i % GOLD_SHADES.length] }} />
          <span style={{ fontFamily: BODY, fontSize: "0.62rem", color: C.muted }}>{s.category}</span>
        </span>
      ))}
    </div>
  );
}

function TxRow({ t, onDelete, pending }: { t: Transaction; onDelete: (id: string) => void; pending: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-sm px-3 py-2" style={{ border: `1px solid ${C.borderSoft}`, background: "rgba(22,17,12,0.5)" }}>
      <div className="min-w-0">
        <p className="truncate" style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.cream }}>{t.description || t.category || "Transaction"}</p>
        <p style={{ fontFamily: BODY, fontSize: "0.6rem", color: C.faint }}>{t.occurred_on}{t.category ? ` · ${t.category}` : ""}{t.recurring ? " · recurring" : ""}</p>
      </div>
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: HEAD, fontSize: "0.9rem", color: t.kind === "income" ? C.gold : "rgba(244,239,229,0.8)" }}>
          {t.kind === "income" ? "+" : "−"}{gbp(t.amount)}
        </span>
        <button onClick={() => onDelete(t.id)} disabled={pending} style={{ fontFamily: BODY, color: C.faint }} aria-label="delete">×</button>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p style={{ fontFamily: BODY, fontSize: "0.74rem", color: C.faint }}>{text}</p>;
}

/* ─────────────────────────── Log modal ─────────────────────────── */

function LogModal({
  pending,
  onClose,
  onCreate,
}: {
  pending: boolean;
  onClose: () => void;
  onCreate: (input: { kind: TxKind; amount: number; category: string; description: string; occurred_on: string; recurring: boolean }) => void;
}) {
  const [kind, setKind] = useState<TxKind>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [recurring, setRecurring] = useState(false);
  const amt = Number(amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-sm px-6 py-5" style={{ border: `1px solid ${C.gold}`, background: "#1a1410" }} onClick={(e) => e.stopPropagation()}>
        <p style={{ fontFamily: HEAD, fontSize: "1rem", letterSpacing: "0.04em", color: C.cream }}>LOG TRANSACTION</p>

        <div className="mt-4 flex gap-2">
          {(["expense", "income"] as TxKind[]).map((k) => (
            <button key={k} onClick={() => setKind(k)} className="flex-1 rounded-sm py-2" style={{ fontFamily: BODY, fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: kind === k ? "#191919" : C.cream, background: kind === k ? C.gold : "transparent", border: `1px solid ${kind === k ? C.gold : C.border}` }}>
              {k}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (£)" className="rounded-sm px-3 py-2 text-sm" style={field()} />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="rounded-sm px-3 py-2 text-sm" style={field()} />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="rounded-sm px-3 py-2 text-sm" style={field()} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-sm px-3 py-2 text-sm" style={field()} />
          <label className="flex items-center gap-2" style={{ fontFamily: BODY, fontSize: "0.74rem", color: C.muted }}>
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} /> Recurring (subscription)
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-sm px-4 py-2" style={{ fontFamily: BODY, fontSize: "0.66rem", letterSpacing: "0.14em", color: C.muted, border: `1px solid ${C.border}` }}>CANCEL</button>
          <button onClick={() => onCreate({ kind, amount: amt, category, description, occurred_on: date, recurring })} disabled={pending || !(amt > 0)} className="rounded-sm px-5 py-2" style={{ fontFamily: BODY, fontSize: "0.66rem", letterSpacing: "0.14em", color: "#191919", background: C.gold, opacity: pending || !(amt > 0) ? 0.5 : 1, cursor: pending || !(amt > 0) ? "not-allowed" : "pointer" }}>
            CREATE
          </button>
        </div>
      </div>
    </div>
  );
}

function field(): React.CSSProperties {
  return { fontFamily: BODY, background: "rgba(255,255,240,0.06)", color: C.cream, border: `1px solid ${C.border}`, outline: "none" };
}
