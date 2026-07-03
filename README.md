# NITDIAN Alumni Network

Web app for the NIT Durgapur International Alumni Network. Members sign up, complete
onboarding, get approved by privileged alumni, then appear in a searchable directory.

## Stack

- **Next.js 16** (App Router, Turbopack, Cache Components/PPR)
- **Supabase**: Postgres + Auth (`@supabase/ssr` cookie sessions) + Storage
- **Tailwind 4** + shadcn/ui, **react-hook-form** + **zod** for forms

## Setup

```bash
npm install
```

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_COMING_SOON_UNTIL=
```

There is no separate staging Supabase project — `.env.local` points at production. Use a
throwaway account for any manual testing; don't approve/reject real pending profiles.

```bash
npm run dev    # http://localhost:3000
npm run build  # production build
npm run lint
```

## Auth & authorization

- Server-side Supabase session via `@supabase/ssr`; `lib/supabase/server.ts` always uses the
  anon key so RLS applies. `lib/supabase/admin.ts` (service role) is only for privilege checks
  that must bypass RLS.
- One role model: `member_memberships` + `membership_privilege` (see `lib/privileges.ts`).
  Privilege checks run as `has_privilege(email, name)` / `has_privilege_for_year(email, name, year)`
  Postgres functions, enforced both in RLS policies and in app code.
- `proxy.ts` (Next's middleware rename) only refreshes the session and gates signed-out users;
  onboarded/approved checks live in the pages that need them (`dashboard`, `directory`, `profile`).

## Database

Schema lives in `supabase/migrations/` (project ref `qklwmgjhskqnfsidfsrr`). To apply new
migrations you need Docker (for `supabase db pull`/`db push`'s shadow database) or a direct
Postgres connection; this repo's migrations so far were captured and applied via the Supabase
Management API (`https://api.supabase.com/v1/projects/{ref}/database/query`) since neither was
available in the environment that wrote them.

## Testing

One Playwright smoke test covers signup → onboarding → dashboard → logout → login → dashboard,
run against the live Supabase project (no staging environment exists):

```bash
npm run test:e2e
```

Each run creates one throwaway `nitdian-e2e+<timestamp>@example.com` auth user + profile row —
there's no teardown, so these accumulate in production. Fine for occasional manual runs; revisit
before wiring this into CI.
