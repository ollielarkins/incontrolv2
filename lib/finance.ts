// Shared finance types + helpers.

export type TxKind = "income" | "expense";

export type Transaction = {
  id: string;
  kind: TxKind;
  amount: number;
  category: string | null;
  description: string | null;
  occurred_on: string;
  recurring: boolean;
};

export const TRANSACTION_COLUMNS =
  "id, kind, amount, category, description, occurred_on, recurring";

export function gbp(n: number): string {
  return "£" + Math.round(n).toLocaleString("en-GB");
}

export function thisMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function sumBy(txs: Transaction[], kind: TxKind): number {
  return txs.filter((t) => t.kind === kind).reduce((a, t) => a + t.amount, 0);
}

export function byCategory(txs: Transaction[], kind: TxKind): { category: string; amount: number }[] {
  const map = new Map<string, number>();
  for (const t of txs.filter((t) => t.kind === kind)) {
    const key = t.category?.trim() || "Uncategorised";
    map.set(key, (map.get(key) ?? 0) + t.amount);
  }
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export type MonthPoint = { label: string; key: string; income: number; spend: number };

// Income vs spend for the last `months` calendar months (oldest → newest).
export function monthlyTrend(txs: Transaction[], months = 6): MonthPoint[] {
  const now = new Date();
  const points: MonthPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
    const inMonth = txs.filter((t) => t.occurred_on.slice(0, 7) === key);
    points.push({ label, key, income: sumBy(inMonth, "income"), spend: sumBy(inMonth, "expense") });
  }
  return points;
}
