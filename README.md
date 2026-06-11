# Latin for Kids 🏛️

A tablet-first, local-first PWA that helps grade-schoolers learn beginner Latin —
vocabulary flashcards, a grammar endings game, and quizzes — with a PIN-gated
parent area for assigning lessons and tracking progress.

**Live app:** https://selleckelliott.github.io/latin-app/

Everything runs on the device: profiles, lesson attempts, and assignments are
stored in IndexedDB, so the app works fully offline after the first visit and
no account or server is ever involved.

## Features

- **Profiles** — Netflix-style picker; first run walks you through creating a
  parent profile (with a 4-digit PIN child gate) and student profiles with
  emoji avatars.
- **Student activities** — vocabulary flashcards ("practice again" requeues a
  card; only first-try knows count), a grammar endings game, and multiple-choice
  quizzes, all driven by validated content packs with immediate green/red
  feedback and kid-sized touch targets.
- **Assignments** — parents assign a unit + activity with a due date; it shows
  up at the top of the student's home screen and auto-completes when the
  student finishes it.
- **Progress** — parent dashboard and per-student views show stats derived
  live from the attempt log (never stored, so they can't drift).
- **PWA** — installable, offline-capable (precached app shell, auto-updating
  service worker), and asks the browser for persistent storage.

## Architecture

```
src/
  app/        entry, router, guards, active-profile context, PIN gate
  content/    unit JSON packs + Zod schema + fail-fast loader
  domain/     pure TS: types, scoring, progress derivation, assignment rules
  data/       Dexie (IndexedDB) database + repository implementations
  features/   profiles (onboarding/picker), student, parent screens
  components/ui  pruned shadcn-style primitives
```

Key rules: domain code has no React/Dexie imports; UI reads via `useLiveQuery`
and writes through repositories; progress is always derived from attempts;
content is Zod-validated at load and fails fast.

See [docs/TECHNICAL_DESIGN.md](docs/TECHNICAL_DESIGN.md) and
[docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for the full design.

## Development

Requires Node 22+.

```bash
npm install
npm run dev        # start the dev server
npm test           # run the Vitest suite (jsdom + fake-indexeddb)
npm run typecheck  # tsc --build
npm run lint       # eslint
npm run build      # production build (includes PWA service worker)
npm run preview    # serve the production build locally
```

CI (`.github/workflows/ci.yml`) runs typecheck → lint → test → build on every
push and PR. Pushes to `main` deploy to GitHub Pages via
`.github/workflows/deploy.yml`.

## Adding content

Drop a new unit JSON file in `src/content/units/` following the schema in
`src/content/schema.ts` (vocab cards, grammar items, quiz questions). It's
validated at load — invalid content fails the build/tests rather than reaching
kids.
