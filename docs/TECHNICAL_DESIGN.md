# Latin Learning App — Technical Design

> Re-engineering `latin-app` from a Figma Make prototype drop-in into a
> production-quality, tablet-first, local-first PWA for a 2nd-grade homeschool
> student.

## 1. Overview

The Latin Learning App helps a young child (2nd grade, homeschooled) learn
beginning Latin through three activities — vocabulary flashcards, a grammar
ending game, and multiple-choice quizzes — while a parent assigns lessons and
tracks progress on the same device.

### Goals

- Run as an installable **PWA on a tablet**, fully offline after first load
- **Persist everything locally** (profiles, attempts, assignments) — no server,
  no accounts, no network dependency
- Single source of truth for lesson **content** (currently duplicated across
  three components)
- Properly engineered: typed, layered, tested, CI-built, deployable
- Keep the prototype's feature scope and visual style

### Non-goals (explicitly deferred)

- Spaced repetition / mastery algorithms
- Audio pronunciation
- Additional content units beyond the Starter Pack
- Multi-device sync or any backend
- Real authentication (the parent PIN is a child gate, not security)

## 2. Current state (what we're fixing)

The repo already has a Vite 7 + React 19 + TypeScript-strict + ESLint 9 scaffold
with the Figma Make prototype copied into `src/`. Remaining problems:

| Problem | Evidence |
|---|---|
| Does not build | shadcn `ui/` components import Tailwind/Radix/clsx etc., none of which are in `package.json` |
| Styles inert | `src/index.css` is the default Vite template; prototype's Tailwind `globals.css` not wired up |
| Data hardcoded in components | `VocabularyLesson`, `QuizScreen`, `GrammarGame` each embed their own lists |
| Content duplicated & inconsistent | `PrimaryVocab.JSON` exists in BOTH `src/components/content/` and `src/content/`, never imported; flashcards/quiz/grammar use three other inline lists |
| No persistence | Scores/assignments live in `useState`; refresh loses everything |
| Fake login | Buttons navigate; username input does nothing |
| Stringly-typed navigation | `useState<Screen>` switch in `App.tsx`; no URLs, no back button |
| ~40 unused shadcn components | Entire `components/ui/` library shipped for 6 used primitives |
| Hardcoded fake students | `Marcus`, `Julia`, `Lucius` literals in `ParentHome`/`AssignLesson` |

## 3. Architecture

### 3.1 Stack

| Concern | Choice | Rationale |
|---|---|---|
| Build | **Vite 7** (existing) | Fast dev server, first-class PWA plugin, simple deploy artifact |
| Language | **TypeScript (strict)** (existing) | Catch content/data shape errors at compile time |
| UI | **React 19** (existing) + Tailwind CSS + pruned shadcn/ui | Matches prototype; keep only `button`, `input`, `select`, `card`, `progress`, `dialog` |
| Routing | **react-router** | Real URLs; tablet back button works; deep-linkable activities |
| Storage | **Dexie** (IndexedDB) + `dexie-react-hooks` | Typed tables, reactive `useLiveQuery`, async-safe, room to grow |
| Validation | **Zod** | Content packs validated at load; schema is the contract |
| State | React Context (active profile only) | Persistent state lives in IndexedDB; no global store needed |
| Tests | **Vitest** + React Testing Library + `fake-indexeddb` | Domain logic, repositories, and key flows |
| PWA | **vite-plugin-pwa** | Manifest + service worker, offline-first precache |
| CI/CD | GitHub Actions → GitHub Pages | Typecheck, lint, test, build on PR; deploy on main |

### 3.2 Layers

```
src/
├── app/            # main.tsx, App, router, providers, ParentGate
├── content/        # units/*.json, schema.ts (Zod), loader.ts
├── domain/         # types.ts, scoring.ts, progress.ts, assignments.ts (pure TS)
├── data/           # db.ts (Dexie), repositories/
├── features/
│   ├── profiles/   # Onboarding, ProfilePicker
│   ├── student/    # StudentHome, VocabLesson, GrammarGame, Quiz, Results
│   └── parent/     # Dashboard, ProgressView, AssignLesson
├── components/ui/  # pruned shadcn primitives
└── styles/         # globals.css (Tailwind)
```

**Dependency rule:** `features → domain → (nothing)`; `features → data → domain`;
`content` is imported by `domain`/`features` via the loader only. Domain code
never imports React or Dexie — it stays pure and trivially unit-testable.

### 3.3 Content layer

Static, versioned JSON packs under `src/content/units/`. One file per unit.

```ts
// schema.ts (Zod, inferred types shown)
type VocabCard      = { id: string; latin: string; meaning: string; emoji: string };
type GrammarItem    = { id: string; word: string; options: string[]; correct: string };
type QuizQuestion   = { id: string; prompt: string; emoji: string;
                        choices: string[]; answerIndex: number };
type Unit = {
  id: string;            // "starter-pack"
  title: string;         // "Starter Pack – Grade 2"
  order: number;
  vocab: VocabCard[];
  grammar: GrammarItem[];
  quiz: QuizQuestion[];
};
```

- `loader.ts` imports all unit JSON, validates with Zod, and exposes
  `getUnits(): Unit[]` / `getUnit(id)`. Invalid content fails fast with a clear
  error naming the file and field.
- The Starter Pack consolidates every word currently scattered across the
  prototype: `puella, puer, canis, aqua, luna, sol, casa, templum` + the
  `amo`/`sum` conjugation sets + existing quiz questions.
- Adding a unit = adding one JSON file. No component changes.

### 3.4 Data layer (IndexedDB via Dexie)

```ts
// db.ts
profiles:    'id, role'                      // Profile
attempts:    'id, profileId, unitId, completedAt'  // Attempt
assignments: 'id, studentId, status, dueDate'      // Assignment

type Profile = {
  id: string; name: string; role: 'student' | 'parent';
  avatarEmoji: string; pinHash?: string;     // parent only
  createdAt: string;                          // ISO
};

type Activity = 'vocab' | 'grammar' | 'quiz';

type Attempt = {
  id: string; profileId: string; unitId: string; activity: Activity;
  score: number; total: number;
  answers?: number[];                         // quiz only
  completedAt: string;
};

type Assignment = {
  id: string; studentId: string; unitId: string; activity: Activity;
  dueDate: string;                            // YYYY-MM-DD
  status: 'assigned' | 'completed';
  assignedAt: string; completedAt?: string;
};
```

**Repository pattern.** Interfaces live in `domain/`, Dexie implementations in
`data/repositories/`:

```ts
interface AttemptRepo {
  add(a: Attempt): Promise<void>;
  forStudent(profileId: string): Promise<Attempt[]>;
}
// ProfileRepo, AssignmentRepo analogous
```

UI reads reactively with `useLiveQuery` (views update when data changes) and
writes through repositories. The interfaces are the seam where a sync backend
could be added later without touching features.

**Derived, never stored:** progress stats (lessons completed, average score,
per-activity breakdown) are computed in `domain/progress.ts` from `Attempt`
rows. No denormalized counters that can drift.

### 3.5 Profiles & parent gate

- **First run:** onboarding wizard creates one parent profile (name + 4-digit
  PIN) and one or more student profiles (name + avatar emoji).
- **Every launch:** Netflix-style profile picker (replaces the fake login).
  Tapping a student goes straight to their home — no password, it's a child.
- **Parent area:** gated by the PIN (SHA-256 hash stored on the profile).
  Documented in-code as a *child gate*, not a security boundary.
- Active profile is held in React context + `sessionStorage` (survives reload,
  not a device handoff).

### 3.6 Routing

```
/                                  ProfilePicker (or Onboarding on first run)
/student/:sid                      StudentHome — assigned lessons + free practice
/student/:sid/unit/:uid/vocab      Flashcards
/student/:sid/unit/:uid/grammar    Grammar game
/student/:sid/unit/:uid/quiz       Quiz
/student/:sid/unit/:uid/results    Results
/parent                            PIN gate → Dashboard
/parent/student/:sid               ProgressView
/parent/assign                     AssignLesson
```

Route guards: student routes require a matching active student profile;
`/parent/*` requires the PIN-verified flag. Unknown routes redirect to `/`.

### 3.7 Feature behavior notes

- **StudentHome** shows due assignments first (from `AssignmentRepo`), then the
  three free-practice activities. Completing an assigned activity records an
  `Attempt` *and* marks the `Assignment` completed (domain rule in
  `assignments.ts`).
- **VocabLesson** consumes `unit.vocab`; "Practice Again" requeues the card at
  the end of the deck; completion records an attempt (score = cards known on
  first try).
- **GrammarGame / Quiz** consume `unit.grammar` / `unit.quiz`; scoring lives in
  `domain/scoring.ts`; results screen reads from the recorded attempt.
- **ProgressView** renders derived stats per student: lessons completed,
  average score, recent attempts list.

### 3.8 Kid-focused UX rules

- Touch targets ≥ 48 px; text ≥ 18 px in student routes
- Emoji-first visuals; minimal reading required
- Immediate answer feedback (green/red), progress bars on multi-step activities
- No external links or navigation traps inside student routes
- Prototype's visual style (rounded-2xl cards, soft grays) is preserved — this
  is a re-architecture, not a redesign

## 4. Testing strategy

| Layer | Approach |
|---|---|
| `domain/` | Pure unit tests (scoring edge cases, progress derivation, assignment transitions) |
| `content/` | Schema validation test over every shipped unit file |
| `data/` | Repository tests against `fake-indexeddb` |
| `features/` | RTL tests for critical flows: complete a quiz → attempt persisted → results shown; assign lesson → appears on StudentHome → auto-completes |

CI runs `typecheck → lint → test → build` on every push/PR.

## 5. Build & deployment

- GitHub Actions workflow `ci.yml` (PRs + main) and `deploy.yml` (main →
  GitHub Pages, `base` configured in Vite for the repo path)
- `vite-plugin-pwa`: `registerType: 'autoUpdate'`, precache all assets,
  manifest with maskable icons — installable and fully offline on tablet

## 6. Conventions

- **Commits:** authored as `selleck.elliott@gmail.com` (contribution calendar);
  conventional-commit style messages (`feat:`, `fix:`, `docs:`, `chore:`)
- TypeScript `strict: true`; ESLint + Prettier enforced in CI
- IDs: `crypto.randomUUID()`; timestamps: ISO 8601 strings

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| iPadOS evicts IndexedDB for unused web apps | Install as PWA (persistent storage); request `navigator.storage.persist()`; document export/backup as future work |
| Content JSON drifts from schema | Zod validation at load + CI test over all unit files |
| Scope creep into SRS/audio | Non-goals section; deferred list in implementation plan |
