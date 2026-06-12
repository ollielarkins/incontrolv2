"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string } | undefined;

// Builds an absolute URL for the current deployment (used for email-confirmation
// redirects). Pins to the canonical site so links never point at localhost or a
// preview host: an explicit NEXT_PUBLIC_SITE_URL wins, then Vercel's injected
// production domain, then the request's own origin (covers local dev).
async function getOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

// Email + password sign in / register, driven by a hidden `intent` field so a
// single form can serve both modes.
export async function authenticate(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const intent = String(formData.get("intent") ?? "signin");
  const role = String(formData.get("role") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  if (intent === "register") {
    // InControl is built for students — turn others away politely.
    if (role === "other") {
      return { error: "InControl isn't for you." };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${await getOrigin()}/auth/callback`,
        data: role ? { role } : undefined,
      },
    });
    if (error) return { error: error.message };

    // When email confirmation is enabled, Supabase returns no session yet —
    // the user must click the link in their inbox first.
    if (!data.session) {
      return {
        message: `We've sent a confirmation email to ${email}. Check your inbox to verify your account, then sign in.`,
      };
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
