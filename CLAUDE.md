# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal training-tracker PWA (React 19 + Vite + Supabase), UI and domain text in Brazilian Portuguese. Deployed to GitHub Pages at `/plano-de-treino/`. The README (in Portuguese) is the authoritative spec for training rules, persistence and security guarantees — read it before changing behavior.

## Commands

Node.js 24.

- `npm ci` — install
- `npm run dev` — dev server (needs `.env.local` with `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`, see `.env.example`; without them the app shows a "Configuração necessária" screen)
- `npm test` — Vitest (jsdom, globals enabled), run once
- `npx vitest run src/tracker/store.test.ts` — single file; add `-t "<name>"` for a single test
- `npm run build` — `tsc -b` type-check then Vite build (this is also the type-check step; there is no linter)

CI (`.github/workflows/deploy.yml`) runs test + build and deploys to Pages on every push to `main`.

## Architecture

The active UI lives entirely in `src/tracker/`. `src/pages/HomePage.tsx`, `src/data/initializeUser.ts` and the old Supabase tables are the previous version, kept only as historical reference/import source — don't build on them. Exception: `src/data/seedData.ts` is still live — `model.ts` builds the workout plans from it by exercise name.

- **`model.ts`** — pure domain logic: types (`Workout`, `Plan`, `SetLog`, `Settings`), plan generation per phase (`plans('adaptation' | 'consolidation')`), adaptation counting and RPE stage. Key rules: the reference RPE advances every 3 *eligible completed main* sessions (never by date; optional "Extra" plans and cancelled/partial sessions don't count); review opens at the checkpoint (12); consolidation never auto-increases weight; neurological/urgent red flags block activation. Dates use `America/Sao_Paulo`.
- **`store.ts`** — offline-first persistence. Every write goes to IndexedDB (`training-tracker-v3`, keyed `${user}:${id}`) first with a fresh `mutation` UUID and `dirty:true`, and fires a `tracker-change` window event. `syncRecords` pushes dirty records through the `save_tracker_record` RPC (optimistic concurrency on `revision`, idempotent on `mutation_id`), then pulls all remote rows. A `REVISION_CONFLICT` stores the remote row in `record.conflict`; conflicts are never auto-resolved — the user picks via `resolveConflict`. Sync is serialized per user via `navigator.locks`.
- **`legacy.ts`** — one-way import of the old schema (`workout_sessions`, `exercise_sets`, `cardio_sessions`, `body_measurements`, `weekly_checkins`) into local records via `importLegacy`, which never overwrites an existing record.
- **`Tracker.tsx`** — the whole app UI (`HomePage` export). A session is one atomic `session` record containing a full snapshot of its plan, so plan changes never alter past sessions. Settings use a fixed record id.
- **`src/auth/AuthProvider.tsx`** — caches the last signed-in user in `localStorage` (`training.offline-user`) so the app opens offline; that cached user is only used while offline, and sync still requires a real Supabase session.
- **`db/tracker.sql`** — schema for `tracker_records` (RLS forced, per-`auth.uid()` policies, anon revoked) and the `SECURITY INVOKER` `save_tracker_record` function. Applied to Supabase as migration `atomic_tracker_records`; the abandoned draft migration mentioned in `docs/implementation-progress.md` must not be applied.

Tests use `fake-indexeddb/auto` and `vi.mock('../lib/supabase', ...)` with an in-memory cloud that emulates the RPC's revision/idempotency semantics — keep that mock consistent with `db/tracker.sql` when changing either.

## Conventions

- Code in `src/tracker/` is written in a very compact style (one-line functions, minimal whitespace, terse names); match it there. Comments are rare and explain *why*.
- Only the publishable Supabase key may appear in code/CI; never a `service_role` or secret key.
