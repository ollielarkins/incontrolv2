// Shared Quality of Life types + helpers.

export type ScheduleBlock = { id: string; time: string; topic: string; detail: string };
export type Todo = { id: string; text: string; done: boolean };
export type Bookmark = { id: string; label: string; url: string };

export type Qol = {
  daily_focus: string;
  schedule: ScheduleBlock[];
  notes: string;
  todos: Todo[];
  bookmarks: Bookmark[];
};

export const QOL_COLUMNS = "daily_focus, schedule, notes, todos, bookmarks";

export function emptyQol(): Qol {
  return { daily_focus: "", schedule: [], notes: "", todos: [], bookmarks: [] };
}
