// Shared design tokens + navigation for the InControl app shell.

export const C = {
  gold: "#B5905A",
  goldText: "#C8A57D",
  cream: "#F4EFE5",
  muted: "rgba(244,239,229,0.45)",
  faint: "rgba(244,239,229,0.28)",
  panel: "rgba(22,17,12,0.72)",
  panelSolid: "#1a1410",
  border: "rgba(181,144,90,0.22)",
  borderSoft: "rgba(181,144,90,0.14)",
  pageBg: "#141110",
};

export const HEAD = "'IntroRust', sans-serif";
export const BODY = "'GlacialIndifference', sans-serif";

export type NavItem = { label: string; href: string; enabled: boolean };

// Order + labels match the page designs.
export const NAV: NavItem[] = [
  { label: "COMMAND", href: "/dashboard", enabled: true },
  { label: "FINANCE", href: "/finance", enabled: true },
  { label: "ROADMAPS", href: "/roadmaps", enabled: true },
  { label: "CAREER", href: "/career", enabled: true },
  { label: "QUALITY OF LIFE", href: "/quality-of-life", enabled: true },
  { label: "OBJECTIVES", href: "/objectives", enabled: true },
  { label: "STRATEGIST", href: "/strategist", enabled: true },
];
