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
