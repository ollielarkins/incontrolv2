// Shared objective types + helpers (used by the page, actions, and board).

export type Subtask = { id: string; text: string; done: boolean };

export type Objective = {
  id: string;
  title: string;
  topic: string | null;
  category: string | null;
  due_date: string | null;
  linked_node: string | null;
  subtasks: Subtask[];
};

// Columns selected wherever objectives are read.
export const OBJECTIVE_COLUMNS =
  "id, title, topic, category, due_date, linked_node, subtasks";

export function progressOf(subtasks: Subtask[]): number {
  if (!subtasks || subtasks.length === 0) return 0;
  const done = subtasks.filter((s) => s.done).length;
  return Math.round((done / subtasks.length) * 100);
}

// Whole days from today until the due date (negative = overdue).
export function daysUntil(due: string | null): number | null {
  if (!due) return null;
  const target = new Date(due + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}
