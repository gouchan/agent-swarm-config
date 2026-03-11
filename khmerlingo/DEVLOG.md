# KhmerLingo Development Log

## Session 1 — Initial Build (2026-02-28)

### Phase 1: Research & Architecture

Researched existing Duolingo clones and Khmer language resources:
- **dukkee/duolingo-ui** — Extracted the "3D press" button pattern (`border-b-4 active:border-b-2 active:translate-y-[2px]`) and Duolingo color palette
- **sanidhyy/duolingo-clone** — Adopted component architecture: Quiz state machine, Challenge/ChallengeCard pattern, LessonFooter with status transitions
- **Khmer Unicode** — Used U+1780-U+17FF block with Noto Sans Khmer font for authentic script rendering

Architecture decisions:
- Next.js 14 App Router (not Pages) for modern React patterns
- Zustand with `persist` middleware for game state (XP, hearts, streaks, badges)
- Framer Motion for all animations (card transitions, confetti, bouncing)
- Tailwind CSS with custom Duolingo-inspired design tokens

### Phase 2: Parallel Build

Built the core app with 3 parallel workstreams:
1. **Config & infrastructure** — package.json, tsconfig, tailwind.config.ts, next.config, NLP utilities, game store
2. **Content authoring** — 10 complete beginner modules (118 vocab items, 100+ challenges) covering Greetings, Numbers, Alphabet, Food, Family, Colors, Days, Body Parts, Places, Phrases
3. **UI components** — 17 React components: Button, ProgressBar, Heart, ConfettiBurst, Sidebar, MobileHeader, LessonPath, XPWidget, Quiz, Challenge, ChallengeCard, LessonHeader, LessonFooter, ResultScreen, etc.

### Phase 3: Build Fixes

Fixed several TypeScript and Next.js issues:
- `next.config.ts` → `next.config.mjs` (Next.js 14 doesn't support .ts config)
- `XpWidget` → `XPWidget` (export name case mismatch)
- `module` → `lessonModule` variable rename (Next.js lint: `no-assign-module-variable`)
- `[...normalized]` → `Array.from(normalized)` in khmer-nlp.ts (TypeScript downlevelIteration)
- Layout font: switched to `next/font/google` for Inter, CSS import for Noto Sans Khmer

### Phase 4: Enhancements — Audio, Context, Desktop UX

Added rich learning features beyond basic Duolingo:

**Audio System:**
- ElevenLabs TTS API route (`/api/tts`) with `eleven_multilingual_v2` model
- Server-side Blob caching (200 entry LRU)
- Web Speech API fallback for Khmer (km-KH locale)
- Web Audio API sound effects (correct: ascending tone, wrong: descending)
- Preloading: batch-preload vocabulary audio when module loads

**Cultural Context (800 lines):**
- Every vocab item (118 total) has: cultural note, mnemonic memory trick
- ~70% have character breakdowns showing compound word etymology
- ~35% have fun facts (historical, linguistic, cultural)
- Commonly confused word pairs have wrongAnswerTips

**Desktop Advantages:**
- Keyboard shortcuts: 1-4 select answers, Enter check/continue
- Rich context panel in lesson footer: 2-column layout with cultural note, mnemonic, character breakdown, fun fact
- Shows context on both correct (celebrate + learn more) and wrong (learn from mistake)

**Challenge Cards Enhanced:**
- Emoji illustrations from vocab data
- Audio button per card (Volume2 icon)
- Romanized pronunciation on ASSIST-type cards
- Keyboard hint badges (1-4) in corners

### Phase 5: Flashcards & Trivia

**Flashcard Study Mode:**
- 3D flip animation (Framer Motion rotateY with perspective: 1000px)
- Front: Khmer script + emoji illustration + "Tap to reveal"
- Back: English + romanized pronunciation + Listen button + mnemonic + fun fact
- Deck manager: progress bar, know/study-again tracking, navigation
- Keyboard: Space/Enter flip, K = know it, R = study again, arrows navigate
- Completion screen with "Continue to Quiz" flow

**Trivia Integration:**
- Result screen shows 2-3 random fun facts from the completed module's vocabulary
- "Did You Know?" panel with cultural facts
- "Study Cards" link below each unlocked module in the skill tree

**Build Verification:**
- All routes compile: `/`, `/flashcards/[moduleId]`, `/learn/[moduleId]`, `/profile`, `/api/tts`
- Zero TypeScript errors, zero lint warnings
- Static pages: 6 prerendered, dynamic routes server-rendered on demand

---

## Session 2 — Security Hardening + Polish (2026-03-11)

### Security Audit

Ran a 3-agent parallel audit (security-reviewer, perf-profiler, explore-high) and identified 13 findings:

**Critical/High:**
- No rate limiting on any API route — any client could flood TTS/translate/grade endpoints
- TTS cache used entry-count only (200 entries), not byte-based — large audio could exhaust memory
- `/api/translate` trusted TypeScript types alone for `from`/`to` lang params — no runtime allowlist
- `/api/grade-challenge` had no input length limits; `acceptedAnswers` array unbounded
- LocalStorage game state loaded into Zustand store without schema validation — tampered data could corrupt state
- Error messages leaked env var names (`ELEVENLABS_API_KEY missing`)

**Medium/Low:**
- No HTTP security headers (Content-Type-Options, Frame-Options, Referrer-Policy, Permissions-Policy)
- Translate widget had no textarea `maxLength` and no debounce cleanup on unmount (memory leak)
- New profiles started with 0 gems instead of the README-specified 200

### Fixes Applied

1. **`src/lib/rate-limit.ts`** (new) — Shared IP-based in-memory rate limiter used across all routes
2. **`/api/tts`** — Rate limit 30/min, 500-char max, byte-based LRU cache (50 MB ceiling), generic error message
3. **`/api/translate`** — Rate limit 60/min, runtime `["en","km"]` allowlist
4. **`/api/grade-challenge`** — Rate limit 120/min, 500-char limits per field, max 20 acceptedAnswers
5. **`next.config.mjs`** — 4 security headers on all routes
6. **`profile-store.ts`** — Full schema sanitization before `useGameStore.setState()`, `freshGameData.gems: 200`
7. **`game-store.ts`** — Fixed initial `gems: 0 → 200`
8. **`translate-widget.tsx`** — `useEffect` cleanup + `maxLength={500}`

### Avatar Picker Upgrade

Expanded from 24 hardcoded emojis to ~192 across 8 categorized tabs:
- Smileys (24), People (24), Animals (24), Food (24), Sports (24), Nature (24), Cambodia (24), Fun (24)
- Category tabs with active underline in profile color
- Scrollable 8-column grid, highlights current selection
- Fixed nested `<a>` hydration error in `lesson-path.tsx` — "Study Cards" Link inside `<a>` replaced with `useRouter.push()`

### Profile Name Editing

- Added hover-reveal ✏️ pencil icon next to each profile name (using Lucide `Pencil`)
- Click pencil OR double-click name to enter edit mode
- Edit input styled with blue border + placeholder "Your name…"
- Named Tailwind group (`group/name`) drives opacity transition on pencil icon
- Updated hint text: "Tap avatar to change emoji • Hover name to rename ✏️"

---

## Architecture Notes

### State Machine (Quiz)
```
none → (select option) → none (selected)
     → (check) → correct | wrong
     → (next) → none (next challenge) | completed
```

### Data Flow
```
modules.ts (vocabulary + challenges)
    ↓
Quiz → derives: currentVocabItem, vocabContext, optionIllustrations
    ↓
Challenge → ChallengeCard (illustration, audio, keyboard hint)
    ↓
LessonFooter → context panel (cultural note, mnemonic, breakdown)
    ↓
ResultScreen → fun facts trivia panel
```

### File Size Summary
| File | Lines | Purpose |
|------|-------|---------|
| modules.ts | 2,229 | 10 modules, all vocab + challenges |
| cultural-context.ts | 793 | Cultural data for 118 vocab items |
| quiz.tsx | 242 | Quiz state machine + wiring |
| game-store.ts | ~150 | Zustand state (XP, hearts, streaks) |
| flash-card-deck.tsx | ~200 | Flashcard deck manager |
