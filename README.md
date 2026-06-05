# InControl

**The Personal OS web app for students and young adults** — manage tasks, finances, goals, and habits in one place.

Built with Next.js 16 (App Router) and Supabase for authentication and data.

---

## Features

- **Authentication** — email/password and Google OAuth, powered by Supabase Auth with secure, cookie-based sessions.
- **Guided onboarding** — a 7-step flow (identity → directions → goals → time commitment → roadmap → integrations → confirmation) that new members complete once. Returning users skip straight to the dashboard.
- **Onboarding gate** — session refresh and route protection handled in `proxy.ts`; the dashboard verifies the `onboarded` flag close to the data.
- **Brand UI** — glassmorphism design using the IntroRust and GlacialIndifference typefaces over a custom texture.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js 16.2.7](https://nextjs.org) (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4 |
| Auth & DB | [Supabase](https://supabase.com) (`@supabase/supabase-js`, `@supabase/ssr`) |
| Language | TypeScript |

> **Note:** This project targets Next.js 16, where the `middleware` file convention has been renamed to **`proxy`**. Session handling lives in `proxy.ts` at the repo root.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root (see `.env.local.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Optional — set in production so OAuth/email links point at your real domain.
# In local dev this is inferred from the request host automatically.
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Find these under **Supabase dashboard → Project Settings → API**. `.env.local` is gitignored — never commit real keys.

### 3. Set up the database

Run the migration once in **Supabase dashboard → SQL Editor → New query**, pasting the contents of:

```
supabase/migrations/0001_profiles.sql
```

This creates the `profiles` table (with Row Level Security), a trigger that auto-creates a profile for each new user, and the `onboarded` flag that drives the onboarding gate.

### 4. (Optional) Enable Google sign-in

1. In **Google Cloud Console**, create an OAuth 2.0 Client ID (Web application).
2. Add the authorized redirect URI: `https://YOUR-PROJECT-ref.supabase.co/auth/v1/callback`.
3. In **Supabase → Authentication → Providers → Google**, enable it and paste the Client ID + Secret.
4. In **Supabase → Authentication → URL Configuration**, add `http://localhost:3000/**` (and your production URL) to the Redirect URLs.

> Email confirmation is on by default. For fast local testing, you can turn it off under **Authentication → Sign In / Providers → Email**.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with ESLint |

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Auth landing — sign in / register / Google |
| `/onboarding` | 7-step onboarding wizard (new members only) |
| `/welcome` | Post-onboarding splash, then redirects to the dashboard |
| `/dashboard` | Protected home (redirects un-onboarded users into the flow) |
| `/auth/callback` | Exchanges the OAuth / email-confirmation code for a session |

## Project structure

```
app/
  page.tsx                 # Auth landing page
  actions/
    auth.ts                # Sign in / up / Google / sign out (Server Actions)
    onboarding.ts          # Persist onboarding answers
  auth/callback/route.ts   # OAuth + email confirmation handler
  onboarding/              # Onboarding wizard + gate
  welcome/                 # Welcome splash
  dashboard/page.tsx       # Protected dashboard
lib/
  onboarding.ts            # Shared onboarding types & option sets
  supabase/
    client.ts              # Browser Supabase client
    server.ts              # Server Supabase client (cookies)
    proxy.ts               # Session refresh + route guard helper
proxy.ts                   # Next.js 16 proxy (formerly middleware)
supabase/migrations/       # SQL migrations
```

## License

Private project. All rights reserved.
