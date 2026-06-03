"use client";

import { useState } from "react";

export default function Home() {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [role, setRole] = useState<"student" | "educator">("student");

  return (
    <div
      className="flex flex-col items-center justify-between py-45.25 px-10"
      style={{
        background: "#0d0b08",
        backgroundImage: "url('/Welcome, (1).png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Top section: quote + logo + welcome + tagline */}
      <div className="flex flex-col items-center gap-5 w-full max-w-2xl">
        <p
          className="text-center max-w-2xl text-base leading-relaxed"
          style={{
            fontFamily: "var(--font-im-fell), serif",
            fontStyle: "italic",
            color: "#c8b89a",
            textShadow: "0 1px 8px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)",
          }}
        >

        </p>

        {/* Logo + name */}
        <div className="flex items-center gap-3">
          <div
            className="w-15 h-15 rounded-xl flex items-center justify-center"
            style={{ background: "#b5905a" }}
          >
            <svg width="34" height="34" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#1a1409" />
              <rect x="12" y="2" width="8" height="8" rx="1.5" fill="#1a1409" />
              <rect x="2" y="12" width="8" height="8" rx="1.5" fill="#1a1409" />
              <rect x="12" y="12" width="8" height="8" rx="1.5" fill="#1a1409" />
            </svg>
          </div>
          <span
            className="text-3xl font-semibold tracking-wide"
            style={{
              color: "#f0e8d8",
              textShadow: "0 2px 12px rgba(0,0,0,0.95)",
            }}
          >
            InControl
          </span>
          <span
            className="px-2 py-0.5 rounded border"
            style={{
              borderColor: "#4a4030",
              fontSize: "0.75rem",
              fontFamily: "var(--font-im-fell), serif",
              fontStyle: "italic",
              color: "#f0e8d8",
              textAlign: "center",
              textShadow: "0 2px 20px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.7)",
            }}
          >
            v1
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1
            className="text-5xl leading-tight"
            style={{
              fontFamily: "var(--font-im-fell), serif",
              fontStyle: "italic",
              color: "#f0e8d8",
              textAlign: "center",
              textShadow: "0 2px 20px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.7)",
            }}
          >
            The Personal OS for Students
          </h1>
          <p
            className="text-center text-xl leading-snug"
            style={{
              fontFamily: "var(--font-im-fell), serif",
              fontStyle: "italic",
              color: "#c8b89a",
              textShadow: "0 1px 10px rgba(0,0,0,0.95)",
            }}
          >
            
            <br>
            </br>
          </p>
        </div>
      </div>

      {/* Card section */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-120">
        {/* Card */}
        <div
          className="w-full rounded-2xl p-10 flex flex-col gap-5"
          style={{
            background: "rgba(20, 16, 10, 0.55)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255, 220, 160, 0.1)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          }}
        >
          {/* Sign up / Sign in toggle */}
          <div className="flex gap-3">
            <button
              onClick={() => setMode("signup")}
              className="flex-1 py-3 rounded-lg text-sm font-bold transition-colors"
              style={
                mode === "signup"
                  ? { background: "#f0e8d8", color: "#0d0b08" }
                  : {
                      background: "rgba(30, 24, 16, 0.85)",
                      color: "#c8b89a",
                      border: "1px solid #5a4e3a",
                    }
              }
            >
              Sign up
            </button>
            <button
              onClick={() => setMode("signin")}
              className="flex-1 py-3 rounded-lg text-sm font-bold transition-colors"
              style={
                mode === "signin"
                  ? { background: "#f0e8d8", color: "#0d0b08" }
                  : {
                      background: "rgba(30, 24, 16, 0.85)",
                      color: "#c8b89a",
                      border: "1px solid #5a4e3a",
                    }
              }
            >
              Sign in
            </button>
          </div>

          {/* Role toggle */}
          <div className="flex gap-3">
            <button
              onClick={() => setRole("student")}
              className="flex-1 py-2.5 rounded-lg text-sm transition-colors"
              style={
                role === "student"
                  ? {
                      background: "rgba(30, 24, 16, 0.85)",
                      color: "#e0c070",
                      border: "1px solid #e0c070",
                      fontStyle: "italic",
                    }
                  : {
                      background: "rgba(30, 24, 16, 0.85)",
                      color: "#a09070",
                      border: "1px solid #5a4e3a",
                      fontStyle: "italic",
                    }
              }
            >
              I am a Student
            </button>
            <button
              onClick={() => setRole("educator")}
              className="flex-1 py-2.5 rounded-lg text-sm transition-colors"
              style={
                role === "educator"
                  ? {
                      background: "rgba(30, 24, 16, 0.85)",
                      color: "#e0c070",
                      border: "1px solid #e0c070",
                      fontStyle: "italic",
                    }
                  : {
                      background: "rgba(30, 24, 16, 0.85)",
                      color: "#a09070",
                      border: "1px solid #5a4e3a",
                      fontStyle: "italic",
                    }
              }
            >
              I am an Educator
            </button>
          </div>

          {/* Email input */}
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={{
              background: "rgba(30, 24, 16, 0.85)",
              color: "#f0e8d8",
              border: "1px solid #5a4e3a",
              fontStyle: "italic",
            }}
          />

          {/* Password input */}
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={{
              background: "rgba(30, 24, 16, 0.85)",
              color: "#f0e8d8",
              border: "1px solid #5a4e3a",
              fontStyle: "italic",
            }}
          />

          {/* Primary action button */}
          <button
            className="w-full py-3 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
            style={{
              background: "rgba(30, 24, 16, 0.85)",
              color: "#f0e8d8",
              border: "1px solid #5a4e3a",
            }}
          >
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "#5a4e3a" }} />
            <span className="text-xs font-medium" style={{ color: "#a09070" }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ background: "#5a4e3a" }} />
          </div>

          {/* Google button */}
          <button
            className="w-full py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{
              background: "rgba(30, 24, 16, 0.85)",
              color: "#f0e8d8",
              border: "1px solid #5a4e3a",
            }}
          >
            <GoogleIcon />
            Sign in with Google
          </button>
        </div>
      </div>


      {/* Footer */}
      <p className="text-xs tracking-widest" style={{ color: "#a09070", textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}>
        
      </p>
    </div>
  );
}

function CreationOfAdamHands() {
  return (
    <svg
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10"
      width="800"
      height="400"
      viewBox="0 0 800 400"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none' }}
    >
      {/* Left hand reaching out */}
      <g transform="translate(200, 200)">
        <path
          d="M50 50 C50 30, 70 10, 90 10 C110 10, 130 30, 130 50"
          fill="#f0e8d8"
          stroke="#f0e8d8"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="M130 50 C130 70, 110 90, 90 90 C70 90, 50 70, 50 50"
          fill="transparent"
          stroke="#f0e8d8"
          strokeWidth="20"
          strokeLinecap="round"
        />
        {/* Fingers */}
        <path d="M60 40 C60 20, 70 0, 80 0" stroke="#f0e8d8" strokeWidth="12" strokeLinecap="round" />
        <path d="M80 35 C80 15, 90 0, 100 0" stroke="#f0e8d8" strokeWidth="12" strokeLinecap="round" />
        <path d="M100 40 C100 20, 110 0, 120 0" stroke="#f0e8d8" strokeWidth="12" strokeLinecap="round" />
        <path d="M110 50 C110 30, 120 10, 130 10" stroke="#f0e8d8" strokeWidth="12" strokeLinecap="round" />
      </g>

      {/* Right hand reaching out */}
      <g transform="translate(600, 200) scale(-1, 1)">
        <path
          d="M50 50 C50 30, 70 10, 90 10 C110 10, 130 30, 130 50"
          fill="#f0e8d8"
          stroke="#f0e8d8"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="M130 50 C130 70, 110 90, 90 90 C70 90, 50 70, 50 50"
          fill="transparent"
          stroke="#f0e8d8"
          strokeWidth="20"
          strokeLinecap="round"
        />
        {/* Fingers */}
        <path d="M60 40 C60 20, 70 0, 80 0" stroke="#f0e8d8" strokeWidth="12" strokeLinecap="round" />
        <path d="M80 35 C80 15, 90 0, 100 0" stroke="#f0e8d8" strokeWidth="12" strokeLinecap="round" />
        <path d="M100 40 C100 20, 110 0, 120 0" stroke="#f0e8d8" strokeWidth="12" strokeLinecap="round" />
        <path d="M110 50 C110 30, 120 10, 130 10" stroke="#f0e8d8" strokeWidth="12" strokeLinecap="round" />
      </g>

      {/* Gap between hands (the touch point) */}
      <circle cx="400" cy="200" r="25" fill="transparent" stroke="#f0e8d8" strokeWidth="2" strokeOpacity="0.5" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
