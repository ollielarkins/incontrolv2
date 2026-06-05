// Shared onboarding types + option sets, used by both the client wizard and
// the server action that persists answers to Supabase.

export type Horizon = "weeks" | "months" | "years";

export type Goal = { text: string; horizon: Horizon };

export type OnboardingData = {
  identity: string | null;
  directions: string[];
  goals: Goal[]; // exactly 3
  weeklyHours: number; // 1..40 (40 means "40+")
  targetRole: string;
  targetHorizon: Horizon;
  integrations: string[];
};

export const IDENTITIES = [
  "Student",
  "Early Career",
  "Transitioning",
  "None of these",
] as const;

export const DIRECTIONS = [
  "Academics",
  "Career",
  "Finances",
  "Health",
  "Fitness",
  "Productivity",
  "Relationships",
  "Side Projects",
  "Skills",
  "Mental Health",
  "Networking",
  "Creativity",
  "Travel",
  "Habits",
] as const;

export const INTEGRATIONS = [
  "Google Account",
  "Bank",
  "LinkedIn",
  "Calendar",
  "Student Portal",
  "Google Drive",
] as const;

export const HORIZONS: Horizon[] = ["weeks", "months", "years"];

export const TIME_MARKS = [
  { value: 1, label: "1HR" },
  { value: 5, label: "5HR" },
  { value: 10, label: "10HR" },
  { value: 20, label: "20HR" },
  { value: 40, label: "40HR+" },
];

export function emptyOnboardingData(): OnboardingData {
  return {
    identity: null,
    directions: [],
    goals: [
      { text: "", horizon: "months" },
      { text: "", horizon: "months" },
      { text: "", horizon: "months" },
    ],
    weeklyHours: 10,
    targetRole: "",
    targetHorizon: "months",
    integrations: [],
  };
}
