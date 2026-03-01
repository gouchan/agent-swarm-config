# Development Log

## 2026-02-28 - KhmerLingo v2: Conversational Practice, Legendary Mode & Exercise Types

### What Changed
Major feature expansion for KhmerLingo — the Duolingo-style Khmer learning app. Added 5 new exercise types, gamification layers, and a full conversation practice system.

### New Features

**Exercise Types**
- **FILL_BLANK** — Complete-the-sentence challenges with Khmer word pill buttons and audio per option
- **MATCH** — Pair Khmer words with English meanings, two-column drag-select with partial-correct retention on retry
- **CONVERSATIONAL** — Free-text input where users type Khmer answers, graded server-side via fuzzy Levenshtein matching (`/api/grade-challenge`)

**Legendary Mode**
- Mode selector screen on lesson start — Normal (no timer, +10 XP) vs Legendary (timed, +20 XP)
- Per-challenge-type timers (30s SELECT, 45s FILL_BLANK, 60s MATCH, 90s CONVERSATIONAL)
- Gold confetti burst, crown emoji, "LEGENDARY COMPLETE" banner on result screen
- Legendary badge per module tracked in game store

**Conversation Practice Page (`/practice`)**
- 3 pre-built conversation scenarios: "At the Market", "Meeting a Friend", "Ordering Food"
- Chat-style UI with bot messages (Khmer + English + romanized + audio playback)
- Real-time grading of user typed responses via `/api/grade-challenge`
- Star rating and XP rewards on completion

**Bonus Round ("Did You Know?")**
- Randomly-selected cultural trivia question at end of every lesson
- +20 XP bonus, no heart penalty for wrong answers
- Shows explanation regardless of correct/wrong

**Family Leaderboard**
- New `/leaderboard` page with family member profiles
- Animated rank display with XP totals

**Profile System**
- Multi-profile switcher with emoji avatars and color themes
- Profile-specific state via Zustand persistent store
- Avatar picker grid in sidebar and mobile hamburger menu

**Translate Widget**
- Floating English-Khmer translate widget using Google Translate API
- Auto-translate with debounced typing, swap languages button

**UX & Desktop**
- Rich context panels on correct/wrong: cultural notes, mnemonics, character breakdowns, fun facts
- Keyboard shortcuts for quiz (1-4 select, Enter check, Space flip flashcards)
- Responsive mobile fixes: safe areas, flashcard heights, zigzag layout

### Technical Details
- **Grade Challenge API** (`/api/grade-challenge`) — Levenshtein distance fuzzy matching, no external AI dependency. 80% similarity threshold for correct.
- **Translate API** (`/api/translate`) — Server-side Google Translate proxy
- **Game Store** — Added `legendaryModules[]`, `completeLegendaryModule()`, per-module legendary badges
- **Types** — `ExerciseType` union expanded: `'SELECT' | 'ASSIST' | 'MATCH' | 'FILL_BLANK' | 'CONVERSATIONAL'`
- **Build** — Clean: 0 TypeScript errors, 10 routes, ~2000 lines added

### Files Changed
- 20 modified files, 10 new files
- New routes: `/practice`, `/leaderboard`, `/api/grade-challenge`, `/api/translate`
- New data: `conversations.ts` (3 scenarios), expanded `cultural-context.ts` (800+ lines)

---

## 2026-02-27 - KhmerLingo v1: Core Learning App

### What Changed
Built the initial KhmerLingo app — a Duolingo-style Khmer language learning platform with quiz mode, flashcards, audio, and gamification.

### Core Features
- 10 modules with 118 vocabulary items and 80+ challenges
- SELECT and ASSIST challenge types with 3-attempt retry system
- Flashcard mode with 3D flip animation and mastery tracking
- ElevenLabs TTS + Web Speech API fallback for Khmer audio
- XP, hearts, streaks, gems, badges gamification
- Zustand persisted state, Framer Motion animations
- Noto Sans Khmer Unicode font, Duolingo-inspired design system

---

## 2025-02-05 - CLAUDE.md Operational Playbook

### What Changed
Transformed CLAUDE.md from a pure tool catalog into a complete operating manual for Claude agents.

### Additions

**Session Start Checklist**
- Read `tasks/lessons.md` to avoid repeating mistakes
- Read `tasks/todo.md` to resume work
- Run `git status` to understand current state
- Verify last change still builds before continuing

**Workflow Orchestration (7 rules)**
1. Plan Mode Default - enter plan mode for 3+ step tasks
2. Subagent Strategy - offload research/exploration to keep context clean
3. Self-Improvement Loop - capture mistakes in `tasks/lessons.md`
4. Verification Before Done - prove it works before marking complete
5. Demand Elegance - pause and ask "is there a more elegant way?"
6. Autonomous Bug Fixing - just fix it, don't ask for hand-holding
7. Error Recovery - stop, revert, diagnose, re-plan, execute (no fix-on-fix spirals)

**Task Management Protocol**
6-step cycle: Plan First → Verify Plan → Track Progress → Explain Changes → Document Results → Capture Lessons

**Core Principles (with teeth)**
- Simplicity First: smallest change that solves the problem
- No Laziness: find root causes, no `// TODO: fix later`
- Minimal Impact: only touch what's necessary
- No Guessing: read the code or run it, don't assume

**Definition of Done**
| Task Type | Done When |
|-----------|-----------|
| Bugfix | Root cause identified, fix applied, test added, existing tests pass |
| Feature | Implementation complete, tests written, builds clean, no regressions |
| Refactor | Behavior unchanged (proven by tests), no new warnings, cleaner |
| Research | Findings documented, recommendation with tradeoffs, sources cited |

**Project Structure Conventions**
- Generic structure replacing ML-specific scaffold
- `tasks/` directory mandatory for `todo.md` and `lessons.md`

### Why
The original CLAUDE.md listed what tools exist but didn't tell Claude *how to work*. The images from the user showed workflow patterns that make agents effective: planning, self-improvement, error recovery. These behavioral rules are what separate a good agent config from a great one.

### Git Config Fix
Set `user.email` to `robinsonlchan@gmail.com` and `user.name` to `gouchan` so future commits count toward GitHub contributions.

---
