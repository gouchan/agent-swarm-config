# Changelog

All notable changes to KhmerLingo are documented here.

## [0.3.0] - 2026-02-28

### Added
- **CONVERSATIONAL exercise type** — Free-text Khmer input graded via fuzzy Levenshtein matching
- **MATCH exercise type** — Two-column pair matching (Khmer to English) with partial-correct retry
- **FILL_BLANK exercise type** — Sentence completion with Khmer word pill buttons
- **Legendary mode** — Timed challenges with 2x XP multiplier and per-challenge-type timers
- **Conversation practice page** (`/practice`) — Chat-style dialogue practice with 3 scenarios
- **Grade Challenge API** (`/api/grade-challenge`) — Server-side fuzzy answer grading, no AI dependency
- **Bonus round** — "Did You Know?" cultural trivia at the end of every lesson (+20 XP, no penalty)
- **Family leaderboard** (`/leaderboard`) — Animated rank display with XP totals
- **Multi-profile system** — Emoji avatar picker, color themes, per-profile state
- **Translate widget** — Floating English-Khmer translator via Google Translate API
- **Rich context panels** — Cultural notes, mnemonics, character breakdowns on correct/wrong answers
- **CONVERSATIONAL challenges** added to Greetings and Food modules
- **Legendary badges** — One per module, tracked in game store

### Changed
- `ExerciseType` union expanded: added `'MATCH' | 'FILL_BLANK' | 'CONVERSATIONAL'`
- Quiz component refactored to support async grading flow for CONVERSATIONAL type
- Challenge component extended with match columns, conversational textarea, grade feedback
- Lesson footer now shows timer countdown for legendary mode
- Result screen shows gold confetti + crown for legendary completions
- Game store expanded with `legendaryModules[]` and `completeLegendaryModule()`

### Technical
- 20 modified files, 10 new files (~2,000 lines added)
- 0 TypeScript errors, clean Next.js build
- New routes: `/practice`, `/leaderboard`, `/api/grade-challenge`, `/api/translate`

## [0.2.0] - 2026-02-27

### Added
- **Audio system** — ElevenLabs TTS via API route with server-side caching + Web Speech API fallback
- **Flashcard mode** — 3D flip cards with mastery tracking, keyboard shortcuts (Space, K, R)
- **Cultural context** — 800+ lines of cultural notes, mnemonics, fun facts for every vocab item
- **Desktop UX** — Keyboard shortcuts (1-4 select, Enter check), rich 2-column context panels
- **Sound effects** — Correct/wrong answer tones via Web Audio API
- **Profile page** — Stats, badges, progress visualization

## [0.1.0] - 2026-02-27

### Added
- Initial KhmerLingo app with Next.js 14, TypeScript, Tailwind CSS
- 10 modules with 118 vocabulary items and 80+ challenges
- SELECT and ASSIST challenge types with 3-attempt retry
- XP, hearts, streaks, gems, badges gamification system
- Zustand persisted state, Framer Motion animations
- Duolingo-inspired design system with Noto Sans Khmer font
- Sidebar navigation, mobile hamburger menu
- Confetti celebration on lesson completion
