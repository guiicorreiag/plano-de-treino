# Copilot instructions for plano-de-treino

## Project at a glance

This repository is a Vite + React + TypeScript app for a personal training tracker. The active product code lives under `src/tracker`; the legacy UI (`src/pages/HomePage.tsx`, `src/data/initializeUser.ts`) is kept as reference material rather than the live app path.

The app is designed around:
- `src/tracker/Tracker.tsx`: primary UI shell and workout/session flow
- `src/tracker/model.ts`: plan logic, adaptation rules, validation, time-zone helpers, and pure business rules
- `src/tracker/store.ts`: durable IndexedDB-backed local queue and Supabase sync logic
- `src/auth/AuthProvider.tsx`: session handling with offline fallback
- `src/lib/supabase.ts`: environment checks and Supabase client setup
- `db/tracker.sql`: Supabase schema for atomic tracker records and revision checks
- `src/data/seedData.ts`: source data for workout plans and exercise definitions

The repository intentionally separates local persistence from the server side: the browser keeps a per-user pending queue in IndexedDB and syncs to Supabase when online. If a revision conflict is detected, the app presents a deliberate conflict resolution step instead of silently overwriting data.

## Setup and commands

Use Node.js 24.

Install dependencies:
```bash
npm ci
```

Run the full test suite:
```bash
npm test
```

Run a single test file:
```bash
npx vitest run src/tracker/model.test.ts
```

Run a single component test file:
```bash
npx vitest run src/tracker/Tracker.test.tsx
```

Build for production:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

No lint script is defined in `package.json`; do not assume `npm run lint` exists in this repo.

## Required environment configuration

Before running the app locally, configure Supabase values from `.env.example` in a local environment file such as `.env.local`:
```bash
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<public-anon-key>
VITE_BASE_PATH=/plano-de-treino/
```

Never add service-role keys or other secrets to the app or source control.

## Architecture notes that matter for edits

### Tracker flow and data model

The main workout logic is intentionally pure and testable. `src/tracker/model.ts` contains the adaptation and progression logic for:
- main plan phases (`adaptation` / `consolidation`)
- eligible session counting
- symptom checks and red-flag detection
- exercise validation and set-level rules
- local date computation in `America/Sao_Paulo`

When adding new workout rules or UI behavior, prefer changing this model layer before the screen code, because the tests around it encode the domain rules.

### Local-first sync model

`src/tracker/store.ts` is the most important persistence layer to understand before changing sync behavior. Important conventions:
- IndexedDB key format is `${user}:${id}`
- records are queued with `dirty: true` until a successful Supabase RPC response
- `save_tracker_record` is the server RPC used for atomic writes and revision checks
- conflicts are stored in `record.conflict` and shown to the user for explicit resolution
- the sync loop keeps the local queue consistent even when network responses are lost or duplicated

This is not a simple “save to local storage” app; the local queue is intentionally durable and conflict-aware.

### Auth and offline behavior

`AuthProvider` restores a cached `offline-user` from localStorage so the app can still open while offline after a prior authenticated session. The UI always prefers the active Supabase session when online; offline fallback is only used when the network is unavailable.

### Historical and migration constraints

The README and implementation notes explicitly say:
- keep `src/data/seedData.ts` and the old UI as references rather than replacing the active tracker flow
- preserve legacy tables and data import paths when dealing with historical records
- do not re-seed or invent sessions during login
- maintain immutable snapshots for plan version changes

If a change touches history or migration logic, verify it against the session-based rules rather than treating legacy data as normal active data.

## Code conventions specific to this repo

- Prefer editing under `src/tracker` for active app work. `src/data/seedData.ts` is still live: `plans()` in `src/tracker/model.ts` builds every workout plan from it by exercise name, so changing an exercise name or prescription there changes the active app.
- Keep business rules in pure functions and tests. The tracker model has many domain-specific tests; changing rule logic without updating the relevant tests is risky.
- Use Brazil/São Paulo local semantics when working with dates and week boundaries (`America/Sao_Paulo` is used explicitly in several helpers).
- Follow the existing local-first pattern: save local state first, then sync; do not bypass `putRecord` / `syncRecords` for normal state changes.
- Keep user-specific state isolated by `user.id` in IndexedDB and Supabase records.
- Use names and structures consistent with the existing domain language (`phase`, `plan`, `eligible`, `partial`, `checkpoint`, `rpeTarget`, `logs`, `pre`, `post`).
- When adjusting exercise or plan definitions, preserve the historical plan versioning and avoid mutating existing plan snapshots in place. The tests check that snapshot immutability is preserved.
- The project is testing-focused around interaction, sync, and model behavior; prefer targeted tests in the relevant `*.test.ts` or `*.test.tsx` files.

## Useful validation patterns

When changing tracker logic, run the smallest relevant test slice first:
- `npx vitest run src/tracker/model.test.ts` for adaptation and rules
- `npx vitest run src/tracker/store.test.ts` for IndexedDB/sync behavior
- `npx vitest run src/tracker/Tracker.test.tsx` for UI/session interactions

Then run the full suite with `npm test` before broad changes if the targeted tests pass and the change affects multiple areas.

## Repository-specific notes

- The live app is the tracker implementation, not the legacy screens; `seedData.ts` remains its source of plan and exercise definitions.
- `db/tracker.sql` is part of the source of truth for the atomic record schema and security rules; if schema behavior changes, update the SQL and corresponding tests.
- The app is a PWA for personal use and is expected to work offline after initial sync setup; do not assume a constant online connection while developing.
