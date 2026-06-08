// Shared roadmap (skill graph) types + status styling.

export const NODE_STATUSES = ["locked", "unlocked", "active", "completed", "ai_suggested"] as const;
export type NodeStatus = (typeof NODE_STATUSES)[number];

export type RoadmapNode = {
  id: string;
  title: string;
  status: NodeStatus;
  x: number;
  y: number;
  links: string[];
};

export const ROADMAP_COLUMNS = "id, title, status, x, y, links";

export const STATUS_META: Record<NodeStatus, { label: string; color: string; dashed?: boolean; fill?: string }> = {
  locked: { label: "LOCKED", color: "rgba(244,239,229,0.25)" },
  unlocked: { label: "UNLOCKED", color: "#B5905A" },
  active: { label: "ACTIVE", color: "#E3B873", fill: "rgba(181,144,90,0.18)" },
  completed: { label: "COMPLETED", color: "#C8A57D", fill: "rgba(181,144,90,0.4)" },
  ai_suggested: { label: "AI SUGGESTED", color: "#B5905A", dashed: true },
};
