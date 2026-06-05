"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Full-screen "WELCOME TO INCONTROL" splash shown after onboarding, then it
// hands off to the dashboard automatically.
export default function WelcomeSplash() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/dashboard");
    const t = setTimeout(() => router.replace("/dashboard"), 3200);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div
      className="relative flex h-screen w-full cursor-pointer items-center overflow-hidden"
      style={{ background: "#191919" }}
      onClick={() => router.replace("/dashboard")}
    >
      <Image src="/1.png" alt="" fill priority className="object-cover object-center" style={{ opacity: 0.85 }} />
      <div className="absolute inset-0" style={{ background: "rgba(15,12,10,0.55)" }} />

      <div className="ob-slow-fade relative z-10 flex w-full flex-col items-center px-6 text-center">
        <h1
          style={{
            fontFamily: "'IntroRust', sans-serif",
            fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
            color: "#FFFFF0",
            letterSpacing: "0.04em",
            lineHeight: 1.05,
          }}
        >
          WELCOME TO INCONTROL
        </h1>
        <p
          style={{
            fontFamily: "'IntroRust', sans-serif",
            fontWeight: 300,
            fontSize: "clamp(0.85rem, 1.6vw, 1.1rem)",
            color: "rgba(255,255,240,0.7)",
            marginTop: "0.9rem",
            letterSpacing: "0.02em",
          }}
        >
          The Personal OS Webapp for Students and Young Adults
        </p>
        <Image
          src="/Welcome, (4).png"
          alt="Signature"
          width={420}
          height={130}
          priority
          className="object-contain"
          style={{ opacity: 0.8, marginTop: "1.5rem" }}
        />
        <p
          style={{
            fontFamily: "'IntroRust', sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.22em",
            color: "rgba(255,255,240,0.4)",
            marginTop: "2.5rem",
          }}
        >
          LOADING YOUR DASHBOARD…
        </p>
      </div>
    </div>
  );
}
