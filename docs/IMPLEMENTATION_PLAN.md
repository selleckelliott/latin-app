# Latin Learning App — Implementation Plan

Companion to [TECHNICAL_DESIGN.md](./TECHNICAL_DESIGN.md). Phases are ordered by
dependency; each has acceptance criteria that must pass before moving on.

> **Commit identity:** every commit is authored as
> `selleck.elliott@gmail.com`. Set `git config user.email` in the worktree
> before the first commit of each session and verify with
> `git log --format='%ae' -5` after pushing.

## Phase 1 — Scaffold completion

The repo already has Vite 7 + React 19 + TS-strict + ESLint 9. Make it actually
build and match the design layout:

- Add Tailwind CSS; replace template `index.css` with the prototype's
  `globals.css` theme
- Install deps for the six kept shadcn primitives (`button`, `input`, `select`,
  `card`, `progress`, `dialog`): the needed `@radix-ui/*` packages, `clsx`,
  `tailwind-merge`, `class-variance-authority`, `lucide-react`
- Prune the other ~40 `components/ui/` files, `components/figma/`, and the
  duplicate `PrimaryVocab.JSON` (keep one copy under `src/content/`)
- Restructure files into the `src/` layout from the design doc
- Add Prettier; add Vitest with a passing smoke test
- `.github/workflows/ci.yml`: typecheck → lint → test → build

**Accept:** `npm run build` and `npm run dev` succeed; CI green.

## Phase 2 — Content layer

- `src/content/schema.ts`: Zod schemas for `Unit`, `VocabCard`, `GrammarItem`,
  `QuizQuestion`
- `src/content/units/starter-pack.json`: consolidate ALL prototype content
  (PrimaryVocab.JSON + the lists hardcoded in `VocabularyLesson`, `QuizScreen`,
  `GrammarGame`) into one validated unit
- `src/content/loader.ts`: `getUnits()` / `getUnit(id)` with fail-fast
  validation
- Tests: every shipped unit file passes the schema; loader rejects bad fixtures

**Accept:** one source of truth; deleting any hardcoded component list breaks
nothing.

## Phase 3 — Domain + data

- `src/domain/types.ts`: `Profile`, `Attempt`, `Assignment`, `Activity`
- `src/domain/scoring.ts`: quiz/grammar scoring (pure)
- `src/domain/progress.ts`: derive lessons-completed, average score, recent
  attempts from `Attempt[]`
- `src/domain/assignments.ts`: completion rule (attempt for assigned
  unit+activity ⇒ assignment completed)
- `src/data/db.ts`: Dexie schema v1; `src/data/repositories/`: `ProfileRepo`,
  `AttemptRepo`, `AssignmentRepo` (interfaces in domain, Dexie impls here)
- Tests: domain functions exhaustively; repositories against `fake-indexeddb`

**Accept:** full red-green test suite for everything below the UI.

## Phase 4 — Profiles & routing

- Router shell with all routes + guards from the design doc
- First-run onboarding (create parent w/ PIN + student profiles)
- ProfilePicker home screen (replaces `LoginScreen`)
- ParentGate PIN dialog (SHA-256 hash compare)
- ActiveProfile context + `sessionStorage` persistence

**Accept:** fresh install → onboarding → picker → student home and PIN-gated
parent dashboard all navigable; refresh keeps active profile.

## Phase 5 — Student features

Port prototype screens onto content + persistence:

- `StudentHome`: greets active profile; lists due assignments (tap → activity);
  free-practice tiles
- `VocabLesson`: flashcards from `unit.vocab`; practice-again requeue; records
  `Attempt` on completion
- `GrammarGame`: items from `unit.grammar`; scoring via domain; records attempt
- `Quiz`: questions from `unit.quiz`; records attempt with answers
- `Results`: reads the recorded attempt; "again" / "home" actions
- Completing an assigned activity auto-completes the `Assignment`

**Accept:** RTL flow test — assign quiz → student completes → attempt persisted
→ results correct → assignment marked completed. Survives refresh.

## Phase 6 — Parent features

- `Dashboard`: real student profiles with derived lessons/avg-score
- `ProgressView`: per-student derived stats + recent attempts
- `AssignLesson`: pick student (from profiles), unit+activity (from content),
  due date; persists `Assignment`

**Accept:** assignment created in parent area appears on that student's home;
stats update live after each attempt (`useLiveQuery`).

## Phase 7 — PWA + deploy

- `vite-plugin-pwa`: autoUpdate, precache, manifest + maskable icons
- `navigator.storage.persist()` request on first run
- `.github/workflows/deploy.yml` → GitHub Pages (Vite `base` set)
- README: what it is, screenshots, dev setup, deploy URL

**Accept:** Lighthouse PWA installable; works fully offline after install;
public Pages URL live.

## Deferred (do not build now)

Spaced repetition, audio pronunciation, more units, data export/backup UI,
multi-device sync, real auth.
