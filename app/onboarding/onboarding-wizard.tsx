"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { completeOnboarding } from "@/app/actions/onboarding";
import {
  DIRECTIONS,
  HORIZONS,
  IDENTITIES,
  INTEGRATIONS,
  TIME_MARKS,
  emptyOnboardingData,
  type Horizon,
  type OnboardingData,
} from "@/lib/onboarding";

const TOTAL = 7;

const STEP_META = [
  { label: "IDENTITY", q1: "who are you,", q2: "right now?" },
  { label: "DIRECTION", q1: "what matters", q2: "most to you right now?" },
  { label: "GOALS", q1: "name your", q2: "top three directions." },
  { label: "CONSTRAINTS", q1: "how much time", q2: "can you reliably commit?" },
  { label: "ROADMAP", q1: "what skill or role", q2: "do you want to reach?" },
  { label: "INTEGRATIONS", q1: "connect your world", q2: "to your system." },
  { label: "CONFIRMATION", q1: "your system", q2: "is ready." },
];

export default function OnboardingWizard() {
  const [step, setStep] = useState(0); // 0-indexed
  const [data, setData] = useState<OnboardingData>(emptyOnboardingData());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const meta = STEP_META[step];
  const isLast = step === TOTAL - 1;

  function update(patch: Partial<OnboardingData>) {
    setData((d) => ({ ...d, ...patch }));
  }

  function next() {
    setError(null);
    if (step === 0 && !data.identity) return; // require an identity
    if (isLast) {
      finish();
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL - 1));
  }

  function goTo(target: number) {
    if (target <= step) {
      setError(null);
      setStep(target);
    }
  }

  function finish() {
    setError(null);
    startTransition(async () => {
      const res = await completeOnboarding(data);
      // Success redirects server-side; only an error returns here.
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="relative h-screen w-full overflow-hidden" style={{ background: "#191919" }}>
      {/* Background texture */}
      <Image src="/1.png" alt="" fill priority className="object-cover object-center" style={{ opacity: 0.85 }} />
      <div className="absolute inset-0" style={{ background: "rgba(20,16,10,0.55)" }} />

      <div className="relative z-10 flex h-full w-full flex-col px-8 py-7 md:px-16">
        {/* ── Top bar: logo (top-left) + step dots (center) ── */}
        <div className="flex items-center">
          <div className="flex flex-1 justify-start">
            <Image
              src="/Untitled design.png"
              alt="InControl"
              width={438}
              height={102}
              priority
              className="object-contain"
            />
          </div>
          <div className="flex items-center justify-center gap-3">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <StepDot
                key={i}
                n={i + 1}
                state={i < step ? "done" : i === step ? "current" : "todo"}
                onClick={() => goTo(i)}
                clickable={i <= step}
              />
            ))}
          </div>
          <div className="flex-1" />
        </div>

        {/* ── Header: step label + question ── */}
        <div key={`head-${step}`} className="ob-fade mt-8 flex flex-col items-center text-center">
          <p
            style={{
              fontFamily: "'IntroRust', sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.3em",
              color: "#B5905A",
            }}
          >
            STEP {step + 1} OF {TOTAL} | {meta.label}
          </p>
          <h1 className="ob-question mt-3" style={{ fontSize: "3.4rem" }}>
            {meta.q1}
            <br />
            {meta.q2}
          </h1>
        </div>

        {/* ── Step content ── */}
        <div key={`body-${step}`} className="ob-fade flex flex-1 flex-col items-center justify-center">
          <div className="w-full" style={{ maxWidth: 960 }}>
            {step === 0 && <StepIdentity data={data} update={update} />}
            {step === 1 && <StepDirections data={data} update={update} />}
            {step === 2 && <StepGoals data={data} update={update} />}
            {step === 3 && <StepConstraints data={data} update={update} />}
            {step === 4 && <StepRoadmap data={data} update={update} />}
            {step === 5 && <StepIntegrations data={data} update={update} />}
            {step === 6 && <StepConfirmation />}
          </div>
        </div>

        {/* ── Footer: error + continue ── */}
        <div className="flex items-end justify-between">
          <p style={{ fontFamily: "'IntroRust', sans-serif", fontSize: "0.8rem", color: "#E5896A", minHeight: "1.2em" }}>
            {error ?? (step === 0 && !data.identity ? "Pick one to continue." : "")}
          </p>
          <button
            onClick={next}
            disabled={pending || (step === 0 && !data.identity)}
            className="flex items-center gap-2 rounded-sm px-6 py-3 transition-all hover:opacity-90"
            style={{
              fontFamily: "'IntroRust', sans-serif",
              fontSize: "0.8rem",
              letterSpacing: "0.18em",
              background: "#F0EBDD",
              color: "#191919",
              fontWeight: 600,
              opacity: pending || (step === 0 && !data.identity) ? 0.5 : 1,
              cursor: pending || (step === 0 && !data.identity) ? "not-allowed" : "pointer",
            }}
          >
            {pending ? "SAVING…" : isLast ? "FINISH" : "CONTINUE"}
            {!pending && <span style={{ fontSize: "0.9rem" }}>›</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Shared bits ─────────────────────────── */

function StepDot({
  n,
  state,
  onClick,
  clickable,
}: {
  n: number;
  state: "done" | "current" | "todo";
  onClick: () => void;
  clickable: boolean;
}) {
  const filled = state === "done" || state === "current";
  return (
    <button
      onClick={onClick}
      disabled={!clickable}
      className="flex items-center justify-center rounded-full transition-all"
      style={{
        width: state === "current" ? 28 : 24,
        height: state === "current" ? 28 : 24,
        fontFamily: "'IntroRust', sans-serif",
        fontSize: "0.7rem",
        background: filled ? "rgba(181,144,90,0.22)" : "transparent",
        border: `1px solid ${filled ? "#B5905A" : "rgba(255,255,240,0.3)"}`,
        color: filled ? "#F0EBDD" : "rgba(255,255,240,0.4)",
        cursor: clickable ? "pointer" : "default",
      }}
    >
      {n}
    </button>
  );
}

const cardBase: React.CSSProperties = {
  fontFamily: "'IntroRust', sans-serif",
  background: "rgba(15,12,8,0.5)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  color: "#FFFFF0",
  transition: "all 0.18s ease",
};

function selectedBorder(active: boolean) {
  return active ? "1px solid #B5905A" : "1px solid rgba(255,255,240,0.18)";
}

function fieldStyle(): React.CSSProperties {
  return {
    fontFamily: "'IntroRust', sans-serif",
    background: "rgba(255,255,240,0.06)",
    color: "#FFFFF0",
    border: "1px solid rgba(255,255,240,0.25)",
    outline: "none",
  };
}

type StepProps = {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
};

/* ─────────────────────────── Step 1: Identity ─────────────────────────── */

function StepIdentity({ data, update }: StepProps) {
  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
      {IDENTITIES.map((id) => {
        const active = data.identity === id;
        return (
          <button
            key={id}
            onClick={() => update({ identity: id })}
            className="relative flex h-44 flex-col items-center justify-center rounded-md px-4"
            style={{ ...cardBase, border: selectedBorder(active), boxShadow: active ? "0 0 0 1px #B5905A inset" : "none" }}
          >
            <span style={{ fontSize: "0.95rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
              {id}
            </span>
            {active && (
              <span
                className="absolute bottom-3 left-3 rounded-sm px-2 py-1"
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.18em",
                  background: "rgba(181,144,90,0.2)",
                  border: "1px solid #B5905A",
                  color: "#F0EBDD",
                }}
              >
                SELECTED
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Step 2: Directions ─────────────────────────── */

function StepDirections({ data, update }: StepProps) {
  function toggle(d: string) {
    update({
      directions: data.directions.includes(d)
        ? data.directions.filter((x) => x !== d)
        : [...data.directions, d],
    });
  }
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {DIRECTIONS.map((d) => {
        const active = data.directions.includes(d);
        return (
          <button
            key={d}
            onClick={() => toggle(d)}
            className="relative rounded-sm px-5 py-3"
            style={{
              ...cardBase,
              border: selectedBorder(active),
              fontSize: "0.82rem",
              letterSpacing: "0.06em",
            }}
          >
            {d}
            {active && (
              <span
                className="absolute"
                style={{ top: -5, right: -5, width: 12, height: 12, background: "#B5905A", borderRadius: 2 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Step 3: Goals ─────────────────────────── */

function StepGoals({ data, update }: StepProps) {
  function setGoal(i: number, patch: Partial<{ text: string; horizon: Horizon }>) {
    const goals = data.goals.map((g, idx) => (idx === i ? { ...g, ...patch } : g));
    update({ goals });
  }
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {data.goals.map((g, i) => (
        <div key={i} className="relative flex flex-col gap-3 rounded-md p-5" style={{ ...cardBase, border: selectedBorder(false), minHeight: 190 }}>
          <span className="absolute right-4 top-3" style={{ color: "#B5905A", fontSize: "1.1rem", fontFamily: "'IntroRust', sans-serif" }}>
            {i + 1}
          </span>
          <label style={{ fontSize: "0.66rem", letterSpacing: "0.2em", color: "rgba(255,255,240,0.55)" }}>GOAL</label>
          <input
            value={g.text}
            onChange={(e) => setGoal(i, { text: e.target.value })}
            placeholder="e.g. Land a placement"
            className="rounded-sm px-3 py-2 text-sm"
            style={fieldStyle()}
          />
          <label style={{ fontSize: "0.66rem", letterSpacing: "0.2em", color: "rgba(255,255,240,0.55)", marginTop: 4 }}>
            TIME HORIZON
          </label>
          <HorizonSelect value={g.horizon} onChange={(h) => setGoal(i, { horizon: h })} />
        </div>
      ))}
    </div>
  );
}

function HorizonSelect({ value, onChange }: { value: Horizon; onChange: (h: Horizon) => void }) {
  return (
    <div className="flex gap-2">
      {HORIZONS.map((h) => {
        const active = value === h;
        return (
          <button
            key={h}
            onClick={() => onChange(h)}
            className="flex-1 rounded-sm py-2 capitalize"
            style={{
              ...cardBase,
              border: selectedBorder(active),
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
            }}
          >
            {h}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Step 4: Constraints ─────────────────────────── */

function StepConstraints({ data, update }: StepProps) {
  const display = data.weeklyHours >= 40 ? "40+" : String(data.weeklyHours);
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8">
      <div className="flex flex-col items-center">
        <span style={{ fontFamily: "'IntroRust', sans-serif", fontSize: "2.6rem", color: "#F0EBDD", letterSpacing: "0.04em" }}>
          {display}
        </span>
        <span style={{ fontFamily: "'IntroRust', sans-serif", fontSize: "0.72rem", letterSpacing: "0.2em", color: "rgba(255,255,240,0.55)" }}>
          HOURS / WEEK
        </span>
      </div>
      <div className="w-full">
        <input
          type="range"
          min={1}
          max={40}
          value={data.weeklyHours}
          onChange={(e) => update({ weeklyHours: Number(e.target.value) })}
          className="ob-range"
          style={{ accentColor: "#B5905A" }}
        />
        <div className="mt-3 flex justify-between">
          {TIME_MARKS.map((m) => (
            <span key={m.label} style={{ fontFamily: "'IntroRust', sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em", color: "rgba(255,255,240,0.5)" }}>
              {m.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Step 5: Roadmap ─────────────────────────── */

function StepRoadmap({ data, update }: StepProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label style={{ fontSize: "0.66rem", letterSpacing: "0.2em", color: "rgba(255,255,240,0.55)" }}>GOAL</label>
        <input
          value={data.targetRole}
          onChange={(e) => update({ targetRole: e.target.value })}
          placeholder="e.g. Junior Software Engineer"
          className="w-full rounded-sm px-4 py-4 text-base"
          style={fieldStyle()}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label style={{ fontSize: "0.66rem", letterSpacing: "0.2em", color: "rgba(255,255,240,0.55)" }}>TIME HORIZON</label>
        <HorizonSelect value={data.targetHorizon} onChange={(h) => update({ targetHorizon: h })} />
      </div>
    </div>
  );
}

/* ─────────────────────────── Step 6: Integrations ─────────────────────────── */

function StepIntegrations({ data, update }: StepProps) {
  function toggle(name: string) {
    update({
      integrations: data.integrations.includes(name)
        ? data.integrations.filter((x) => x !== name)
        : [...data.integrations, name],
    });
  }
  return (
    <div className="mx-auto grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
      {INTEGRATIONS.map((name) => {
        const active = data.integrations.includes(name);
        return (
          <button
            key={name}
            onClick={() => toggle(name)}
            className="relative rounded-sm px-5 py-4 text-left"
            style={{ ...cardBase, border: selectedBorder(active), fontSize: "0.82rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            {name}
            <span
              className="absolute"
              style={{
                top: -5,
                right: -5,
                width: 12,
                height: 12,
                background: active ? "#B5905A" : "rgba(255,255,240,0.25)",
                borderRadius: 2,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Step 7: Confirmation ─────────────────────────── */

function StepConfirmation() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span style={{ color: "#B5905A", fontSize: "2rem" }}>✦</span>
      <p style={{ fontFamily: "'IntroRust', sans-serif", fontSize: "0.9rem", letterSpacing: "0.06em", color: "rgba(255,255,240,0.7)", maxWidth: 420, lineHeight: 1.7 }}>
        Everything&apos;s set. Hit finish and we&apos;ll assemble your personal OS around the answers you just gave.
      </p>
    </div>
  );
}
