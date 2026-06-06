import Image from "next/image";

/* ───────────────────────────── Types ───────────────────────────── */

type Goal = { text: string; horizon: string };

export type DashboardProfile = {
  onboarded: boolean;
  identity: string | null;
  directions: string[] | null;
  goals: Goal[] | null;
  weekly_hours: number | null;
  target_role: string | null;
  target_horizon: string | null;
  integrations: string[] | null;
};

/* ─────────────────────────── Design tokens ─────────────────────────── */

const C = {
  gold: "#B5905A",
  goldText: "#C8A57D",
  cream: "#F4EFE5",
  muted: "rgba(244,239,229,0.45)",
  faint: "rgba(244,239,229,0.28)",
  panel: "rgba(22,17,12,0.72)",
  panelSolid: "#1a1410",
  border: "rgba(181,144,90,0.22)",
  borderSoft: "rgba(181,144,90,0.14)",
};

const HEAD = "'IntroRust', sans-serif";
const BODY = "'GlacialIndifference', sans-serif";

const NAV = [
  "COMMAND",
  "FINANCE",
  "ROADMAPS",
  "CAREER",
  "ANALYTICS",
  "OBJECTIVES",
  "STRATEGIST",
];

/* ───────────────────────────── Component ───────────────────────────── */

export default function CommandCenter({ profile }: { profile: DashboardProfile }) {
  const goals = (profile.goals ?? []).filter((g) => g?.text?.trim());
  const targetRole = profile.target_role?.trim() || null;

  const objectivesCount = goals.length;
  const skillsInProgress = targetRole ? 1 : 0;

  const today = new Date()
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#141110", color: C.cream }}>
      {/* faint background texture */}
      <Image src="/1.png" alt="" fill priority className="object-cover object-center" style={{ opacity: 0.06 }} />

      {/* ───────── Sidebar ───────── */}
      <aside
        className="relative z-10 flex h-full flex-col"
        style={{ width: 268, borderRight: `1px solid ${C.border}`, background: "rgba(15,11,8,0.85)" }}
      >
        <div className="flex items-center justify-center px-2 pt-4 pb-3">
          <Image src="/logo-mark.png" alt="InControl" width={224} height={65} priority className="object-contain" />
        </div>

        <p className="px-5 pb-2" style={{ fontFamily: HEAD, fontSize: "0.6rem", letterSpacing: "0.28em", color: C.faint }}>
          SYSTEMS
        </p>

        <nav className="flex flex-col">
          {NAV.map((item) => {
            const active = item === "COMMAND";
            return (
              <button
                key={item}
                className="px-5 py-3 text-left transition-colors"
                style={{
                  fontFamily: HEAD,
                  fontSize: "0.74rem",
                  letterSpacing: "0.12em",
                  color: active ? C.cream : C.muted,
                  background: active ? "rgba(181,144,90,0.14)" : "transparent",
                  borderLeft: active ? `2px solid ${C.gold}` : "2px solid transparent",
                }}
              >
                {item}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex w-full justify-center px-2 pb-5">
          <Image
            src="/signature-mark.png"
            alt="Signature"
            width={196}
            height={54}
            className="object-contain"
            style={{ opacity: 0.55 }}
          />
        </div>
      </aside>

      {/* ───────── Main ───────── */}
      <main className="relative z-10 flex-1 overflow-y-auto px-7 py-5">
        {/* Top bar */}
        <header className="flex items-start justify-between">
          <div>
            <h1 style={{ fontFamily: HEAD, fontSize: "2.1rem", letterSpacing: "0.02em", color: C.cream, lineHeight: 1 }}>
              COMMAND CENTER
            </h1>
            <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.muted, marginTop: 6 }}>
              Single source of truth for your progression, finances and momentum.
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p style={{ fontFamily: BODY, fontSize: "0.58rem", letterSpacing: "0.22em", color: C.faint }}>DATE</p>
              <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.goldText, marginTop: 2 }}>{today}</p>
            </div>
            <button
              className="rounded-sm px-5 py-3"
              style={{ fontFamily: BODY, fontSize: "0.72rem", letterSpacing: "0.16em", color: C.cream, border: `1px solid ${C.gold}`, background: "rgba(181,144,90,0.08)" }}
            >
              LOG PROGRESS
            </button>
          </div>
        </header>

        {/* Stats strip */}
        <section
          className="mt-5 flex items-stretch rounded-sm"
          style={{ border: `1px solid ${C.border}`, background: C.panel }}
        >
          <Stat label="NET THIS MONTH" value="£0" sub="0 TRANSACTIONS" />
          <Divider />
          <Stat label="ACTIVE OBJECTIVES" value={String(objectivesCount)} sub="0 OVERDUE" />
          <Divider />
          <Stat label="SKILLS IN PROGRESS" value={String(skillsInProgress)} sub="0 COMPLETED" />
          <Divider />
          <div className="flex flex-col justify-center px-5 py-4" style={{ minWidth: 230 }}>
            <p style={statLabel}>MOMENTUM ACTIVITY</p>
            <Heatmap />
          </div>
          <Divider />
          <div className="flex flex-1 flex-col justify-center px-5 py-4">
            <p style={statLabel}>CASHFLOW</p>
            <div className="mt-1 flex items-center gap-6">
              <MiniMetric label="INCOME" value="£0" />
              <MiniMetric label="SPENT" value="£0" />
              <div className="flex-1">
                <EmptyLineChart />
              </div>
            </div>
          </div>
          <Divider />
          <Stat label="STREAK" value="0" sub="" wide />
        </section>

        {/* Body: center + right columns */}
        <div className="mt-6 flex gap-6">
          {/* Center column */}
          <div className="flex-1">
            {/* Intelligence */}
            <SectionLabel kicker="INTELLIGENCE" title="AI STRATEGIST" action="OPEN >" />
            <div className="rounded-sm px-4 py-4" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center rounded-sm px-3 py-2" style={{ border: `1px solid ${C.borderSoft}` }}>
                  <Image src="/Untitled design.png" alt="" width={92} height={22} className="object-contain" />
                </div>
                <p style={{ fontFamily: BODY, fontSize: "0.82rem", color: C.muted }}>
                  Log your first progress to unlock a strategist briefing.
                </p>
              </div>
            </div>

            {/* Operations */}
            <div className="mt-7">
              <SectionLabel kicker="OPERATIONS" title="ACTIVE OBJECTIVES" />
              {objectivesCount === 0 ? (
                <EmptyState text="No objectives yet." />
              ) : (
                <div className="flex flex-col gap-4">
                  {goals.slice(0, 2).map((g, i) => (
                    <ObjectiveCard key={i} index={i + 1} title={g.text} horizon={g.horizon} />
                  ))}
                  {goals.length > 2 && (
                    <button
                      className="self-end rounded-sm px-4 py-2"
                      style={{ fontFamily: BODY, fontSize: "0.68rem", letterSpacing: "0.12em", color: C.goldText, border: `1px solid ${C.border}` }}
                    >
                      SEE MORE ⌄
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Progression */}
            <div className="mt-7">
              <SectionLabel kicker="PROGRESSION" title="SKILL MOMENTUM" action="OPEN >" />
              {targetRole ? (
                <div className="flex flex-col gap-3">
                  <SkillBar label={targetRole} pct={0} />
                </div>
              ) : (
                <EmptyState text="No skills tracked yet." />
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ width: 300 }} className="flex flex-col gap-5">
            {/* Finance */}
            <Panel>
              <PanelHead title="FINANCE" action="OPEN >" />
              <div className="mt-2 flex gap-8">
                <MiniMetric label="INCOME" value="£0" big />
                <MiniMetric label="SPENT" value="£0" big />
              </div>
              <div className="mt-3">
                <EmptyLineChart height={70} />
              </div>
              <p style={topLine}>TOP SPEND: <span style={{ color: C.faint }}>—</span></p>
              <p style={topLine}>TOP INCOME: <span style={{ color: C.faint }}>—</span></p>
            </Panel>

            {/* Career */}
            <Panel>
              <PanelHead title="CAREER" action="OPEN >" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                <CareerBox value="0" label="INTERVIEWS" />
                <CareerBox value="0" label="OFFERS" />
                <CareerBox value="0" label="PROSPECTED" />
              </div>
              <div className="mt-3 flex items-stretch rounded-sm" style={{ border: `1px solid ${C.border}` }}>
                <div className="flex-1 px-3 py-3">
                  <p style={{ fontFamily: HEAD, fontSize: "1.1rem", color: C.goldText }}>0</p>
                  <button style={{ fontFamily: BODY, fontSize: "0.62rem", letterSpacing: "0.12em", color: C.goldText, marginTop: 4, border: `1px solid ${C.border}`, padding: "2px 8px", borderRadius: 2 }}>
                    SEE MORE ⌄
                  </button>
                </div>
                <div className="flex items-center justify-center px-2" style={{ borderLeft: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: BODY, fontSize: "0.55rem", letterSpacing: "0.18em", color: C.faint, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                    ACCEPTED
                  </span>
                </div>
              </div>
            </Panel>

            {/* Archives */}
            <Panel className="flex-1">
              <p style={{ fontFamily: BODY, fontSize: "0.7rem", letterSpacing: "0.2em", color: C.muted }}>ARCHIVES</p>
              <p style={{ fontFamily: BODY, fontSize: "0.72rem", color: C.faint, marginTop: 10 }}>Nothing archived yet.</p>
            </Panel>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

const statLabel: React.CSSProperties = {
  fontFamily: BODY,
  fontSize: "0.58rem",
  letterSpacing: "0.18em",
  color: C.faint,
};

const topLine: React.CSSProperties = {
  fontFamily: BODY,
  fontSize: "0.64rem",
  letterSpacing: "0.1em",
  color: C.muted,
  marginTop: 8,
};

function Divider() {
  return <div style={{ width: 1, background: C.border }} />;
}

function Stat({ label, value, sub, wide }: { label: string; value: string; sub: string; wide?: boolean }) {
  return (
    <div className="flex flex-col justify-center px-5 py-4" style={{ minWidth: wide ? 150 : 130 }}>
      <p style={statLabel}>{label}</p>
      <p style={{ fontFamily: HEAD, fontSize: "1.7rem", color: C.goldText, lineHeight: 1.1, marginTop: 4 }}>{value}</p>
      {sub && <p style={{ fontFamily: BODY, fontSize: "0.58rem", letterSpacing: "0.1em", color: C.faint, marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

function MiniMetric({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div>
      <p style={{ fontFamily: BODY, fontSize: "0.55rem", letterSpacing: "0.16em", color: C.faint }}>{label}</p>
      <p style={{ fontFamily: HEAD, fontSize: big ? "1.4rem" : "1.05rem", color: C.goldText, marginTop: 2 }}>{value}</p>
    </div>
  );
}

function SectionLabel({ kicker, title, action }: { kicker: string; title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <p style={{ fontFamily: BODY, fontSize: "0.62rem", letterSpacing: "0.22em", color: C.cream }}>{kicker}</p>
        <p style={{ fontFamily: HEAD, fontSize: "0.92rem", letterSpacing: "0.06em", color: C.goldText, marginTop: 3 }}>{title}</p>
      </div>
      {action && <span style={{ fontFamily: BODY, fontSize: "0.64rem", letterSpacing: "0.14em", color: C.muted }}>{action}</span>}
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-sm px-4 py-4 ${className}`} style={{ border: `1px solid ${C.border}`, background: C.panel }}>
      {children}
    </div>
  );
}

function PanelHead({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between">
      <p style={{ fontFamily: HEAD, fontSize: "0.86rem", letterSpacing: "0.06em", color: C.cream }}>{title}</p>
      {action && <span style={{ fontFamily: BODY, fontSize: "0.6rem", letterSpacing: "0.14em", color: C.muted }}>{action}</span>}
    </div>
  );
}

function ObjectiveCard({ index, title, horizon }: { index: number; title: string; horizon: string }) {
  return (
    <div className="rounded-sm px-5 py-4" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
      <div className="flex items-start justify-between">
        <p style={{ fontFamily: BODY, fontSize: "0.6rem", letterSpacing: "0.2em", color: C.faint }}>
          {String(index).padStart(2, "0")}
        </p>
        <p style={{ fontFamily: BODY, fontSize: "0.62rem", letterSpacing: "0.14em", color: C.goldText, textTransform: "uppercase" }}>
          {horizon}
        </p>
      </div>
      <p style={{ fontFamily: HEAD, fontSize: "1.55rem", color: C.cream, lineHeight: 1.05, marginTop: 2 }}>{title}</p>
      <div className="mt-4">
        <ProgressBar pct={0} />
      </div>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <span style={{ fontFamily: BODY, fontSize: "0.56rem", letterSpacing: "0.16em", color: C.faint }}>PROGRESS</span>
      <div className="relative h-[3px] flex-1 rounded" style={{ background: "rgba(181,144,90,0.18)" }}>
        <div className="absolute left-0 top-0 h-full rounded" style={{ width: `${pct}%`, background: C.gold }} />
      </div>
      <span style={{ fontFamily: BODY, fontSize: "0.6rem", color: C.muted }}>{pct}%</span>
    </div>
  );
}

function SkillBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="rounded-sm px-4 py-3" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: BODY, fontSize: "0.74rem", color: C.cream, minWidth: 90, textTransform: "capitalize" }}>{label}</span>
        <div className="relative h-[3px] flex-1 rounded" style={{ background: "rgba(181,144,90,0.18)" }}>
          <div className="absolute left-0 top-0 h-full rounded" style={{ width: `${pct}%`, background: C.gold }} />
        </div>
        <span style={{ fontFamily: BODY, fontSize: "0.6rem", color: C.muted }}>{pct}%</span>
      </div>
    </div>
  );
}

function CareerBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-sm py-3" style={{ border: `1px solid ${C.border}` }}>
      <p style={{ fontFamily: HEAD, fontSize: "1.2rem", color: C.goldText }}>{value}</p>
      <p style={{ fontFamily: BODY, fontSize: "0.5rem", letterSpacing: "0.12em", color: C.faint, marginTop: 2 }}>{label}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-sm px-5 py-6" style={{ border: `1px dashed ${C.borderSoft}`, background: "rgba(22,17,12,0.4)" }}>
      <p style={{ fontFamily: BODY, fontSize: "0.74rem", color: C.faint }}>{text}</p>
    </div>
  );
}

// Empty momentum heatmap — all cells inactive until activity is logged.
function Heatmap() {
  const cols = 18;
  const rows = 5;
  return (
    <div className="mt-2" style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 3, width: 210 }}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div key={i} style={{ aspectRatio: "1", borderRadius: 1, background: "rgba(181,144,90,0.08)" }} />
      ))}
    </div>
  );
}

// Empty chart — baseline only, no data plotted.
function EmptyLineChart({ height = 44 }: { height?: number }) {
  return (
    <svg width="100%" height={height} viewBox="0 0 200 44" preserveAspectRatio="none">
      <line x1="0" y1="43" x2="200" y2="43" stroke="rgba(181,144,90,0.25)" strokeWidth="1" />
    </svg>
  );
}
