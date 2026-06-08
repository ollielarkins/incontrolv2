// Shared career / applications types + helpers.

export const STATUSES = ["planned", "applied", "interview", "accepted", "rejected"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  planned: "PLANNED",
  applied: "APPLIED",
  interview: "INTERVIEW",
  accepted: "ACCEPTED",
  rejected: "REJECTED",
};

export type Application = {
  id: string;
  title: string;
  company: string | null;
  status: Status;
  applied_on: string | null;
  follow_up_on: string | null;
  notes: string | null;
};

export const APPLICATION_COLUMNS =
  "id, title, company, status, applied_on, follow_up_on, notes";

export function countsByStatus(apps: Application[]): Record<Status, number> {
  const c: Record<Status, number> = {
    planned: 0,
    applied: 0,
    interview: 0,
    accepted: 0,
    rejected: 0,
  };
  for (const a of apps) if (a.status in c) c[a.status] += 1;
  return c;
}

export function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const target = new Date(date + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}
