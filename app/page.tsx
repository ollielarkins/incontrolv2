"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { authenticate } from "@/app/actions/auth";

export default function Home() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [role, setRole] = useState<"student" | "other" | null>(null);
  const [state, formAction, pending] = useActionState(authenticate, undefined);

  // InControl is for students — block registration for everyone else.
  const notForYou = mode === "register" && role === "other";

  return (
    <div
      className="relative h-screen flex flex-col items-center justify-between"
      style={{ background: "#191919" }}
    >
      {/* Background hands image */}
      <Image
        src="/1.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
        style={{ opacity: 0.85 }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(20, 16, 10, 0.45)" }} />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-between h-screen w-full pt-2 pb-12 px-4">

        {/* TOP: Logo */}
        <div className="flex flex-col items-center" style={{ marginTop: "-60px" }}>
          <Image
            src="/Untitled design.png"
            alt="InControl"
            width={820}
            height={190}
            priority
            className="object-contain"
          />
        </div>

        {/* MIDDLE: Auth card */}
        <div
          className="relative w-full flex justify-center"
          style={{ maxWidth: "900px" }}
        >

          <div
            className="flex items-center w-full rounded-2xl p-12 pt-8 pb-20"
            style={{
              background: "rgba(15, 12, 8, 0.55)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "none",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              marginBottom: "80px",
            }}
          >
            {/* Left side — CTA + description */}
            <div className="flex-1 flex flex-col justify-center gap-4 pr-16">
              <h2
                style={{
                  fontFamily: "'IntroRust', sans-serif",
                  fontSize: "3.2rem",
                  color: "#FFFFF0",
                  lineHeight: 1.1,
                  letterSpacing: "0.03em",
                }}
              >
                Take Control<br />of Your Life.
              </h2>
              <p
                style={{
                  fontFamily: "'GlacialIndifference', sans-serif",
                  fontWeight: 300,
                  fontSize: "0.95rem",
                  color: "rgba(255,255,240,0.85)",
                  lineHeight: 1.7,
                  maxWidth: "320px",
                }}
              >
                InControl is your personal OS for student life — manage tasks, finances, goals, and habits all in one place.
              </p>
              <div style={{ position: "relative", height: 0 }}>
                <Image
                  src="/Welcome, (4).png"
                  alt="Signature"
                  width={1440}
                  height={440}
                  className="object-contain object-left"
                  style={{ opacity: 0.7, position: "absolute", top: "-95px", left: "-130px" }}
                />
              </div>
            </div>

            {/* Right side — auth form */}
            <form action={formAction} className="auth-form flex flex-col gap-4" style={{ width: "310px" }}>
              <p style={{ fontFamily: "'IntroRust', sans-serif", fontSize: "2.2rem", color: "#FFFFF0", letterSpacing: "0.04em", marginBottom: "4px" }}>
                Welcome,
              </p>

              {/* Carry the current mode + role through to the server action */}
              <input type="hidden" name="intent" value={mode} />
              <input type="hidden" name="role" value={role ?? ""} />

              {/* Sign in / Register */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="flex-1 py-2.5 rounded text-sm font-medium tracking-wide transition-all"
                  style={{
                    fontFamily: "'GlacialIndifference', sans-serif",
                    background: mode === "signin" ? "rgba(181,144,90,0.18)" : "rgba(255,255,240,0.14)",
                    color: "#FFFFF0",
                    border: mode === "signin" ? "1px solid #B5905A" : "1px solid rgba(255,255,240,0.45)",
                  }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="flex-1 py-2.5 rounded text-sm font-medium tracking-wide transition-all"
                  style={{
                    fontFamily: "'GlacialIndifference', sans-serif",
                    background: mode === "register" ? "rgba(181,144,90,0.18)" : "rgba(255,255,240,0.14)",
                    color: "#FFFFF0",
                    border: mode === "register" ? "1px solid #B5905A" : "1px solid rgba(255,255,240,0.45)",
                  }}
                >
                  Register
                </button>
              </div>

              {/* Email + password */}
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="Email"
                className="w-full py-2.5 px-4 rounded text-sm tracking-wide transition-all outline-none"
                style={{
                  fontFamily: "'GlacialIndifference', sans-serif",
                  background: "rgba(255,255,240,0.14)",
                  color: "#FFFFF0",
                  border: "1px solid rgba(255,255,240,0.45)",
                }}
              />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                placeholder="Password"
                className="w-full py-2.5 px-4 rounded text-sm tracking-wide transition-all outline-none"
                style={{
                  fontFamily: "'GlacialIndifference', sans-serif",
                  background: "rgba(255,255,240,0.14)",
                  color: "#FFFFF0",
                  border: "1px solid rgba(255,255,240,0.45)",
                }}
              />

              {/* Role — shown when registering */}
              {mode === "register" && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className="flex-1 py-2.5 rounded text-sm font-medium tracking-wide text-center transition-all"
                    style={{
                      fontFamily: "'GlacialIndifference', sans-serif",
                      background: role === "student" ? "rgba(181,144,90,0.18)" : "rgba(255,255,240,0.14)",
                      color: "#FFFFF0",
                      border: role === "student" ? "1px solid #B5905A" : "1px solid rgba(255,255,240,0.45)",
                    }}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("other")}
                    className="flex-1 py-2.5 rounded text-sm font-medium tracking-wide text-center transition-all"
                    style={{
                      fontFamily: "'GlacialIndifference', sans-serif",
                      background: role === "other" ? "rgba(181,144,90,0.18)" : "rgba(255,255,240,0.14)",
                      color: "#FFFFF0",
                      border: role === "other" ? "1px solid #B5905A" : "1px solid rgba(255,255,240,0.45)",
                    }}
                  >
                    Not a student
                  </button>
                </div>
              )}

              {/* "Not a student" — instant feedback before submitting */}
              {notForYou && (
                <p style={{ fontFamily: "'IntroRust', sans-serif", fontSize: "1rem", color: "#E5896A", letterSpacing: "0.02em" }}>
                  InControl isn&apos;t for you.
                </p>
              )}

              {/* Error message */}
              {state?.error && (
                <p style={{ fontFamily: "'GlacialIndifference', sans-serif", fontSize: "0.8rem", color: "#E5896A" }}>
                  {state.error}
                </p>
              )}

              {/* Info message (e.g. confirmation email sent) */}
              {state?.message && (
                <p style={{ fontFamily: "'GlacialIndifference', sans-serif", fontSize: "0.8rem", color: "#C9A86A", lineHeight: 1.5 }}>
                  {state.message}
                </p>
              )}

              {/* Primary submit */}
              <button
                type="submit"
                disabled={pending || notForYou}
                className="w-full py-2.5 rounded text-sm font-medium tracking-wide transition-all hover:opacity-90"
                style={{
                  fontFamily: "'GlacialIndifference', sans-serif",
                  background: "#B5905A",
                  color: "#191919",
                  border: "1px solid #B5905A",
                  opacity: pending || notForYou ? 0.6 : 1,
                  cursor: pending || notForYou ? "not-allowed" : "pointer",
                }}
              >
                {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>
          </div>
        </div>

        <div />
      </div>
    </div>
  );
}
