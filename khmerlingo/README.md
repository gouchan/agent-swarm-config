# KhmerLingo

**The first Duolingo-style app for learning Khmer (Cambodian).**

Khmer is spoken by 16 million people but absent from Duolingo. KhmerLingo fills that gap with gamified lessons, flashcards, audio, and rich cultural context — all using real Unicode Khmer script (ខ្មែរ).

```
┌─────────────────────────────────────────────────────────────┐
│                     KHMERLINGO                               │
│                                                             │
│   🇰🇭  Learn Khmer • ភាសាខ្មែរ • Free & Open Source        │
│                                                             │
│   10 Modules · 118 Words · Flashcards · Audio · XP System  │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Learning Modes
- **Quiz Mode** — Duolingo-style challenges: SELECT (Khmer → English), ASSIST (English → Khmer), MATCH, FILL_BLANK with instant feedback and rich context popups
- **Flashcard Mode** — 3D flip cards with Khmer script, emoji illustrations, pronunciation, mnemonics, and cultural notes. Track mastery per card

### Rich Content
- **118 vocabulary items** across 10 beginner modules
- **Cultural context for every word** — cultural notes, mnemonics, character breakdowns, fun facts, and commonly confused word tips
- **Emoji illustrations** on answer cards for visual association
- **Romanized pronunciation** for every word

### Audio
- **ElevenLabs TTS** via API route with server-side caching (multilingual v2 model)
- **Web Speech API** fallback for Khmer speech (km-KH locale)
- **Sound effects** — correct/wrong answer tones via Web Audio API

### Gamification
- **XP** — +10 per correct answer
- **Hearts** — 5 lives, lose one per mistake
- **Streaks** — consecutive daily practice tracking
- **Badges** — 9 achievements (First Steps, Cambodian Foodie, Week Warrior, Khmer Graduate, etc.)
- **Trivia** — fun facts shown on lesson completion
- **Progress persistence** — Zustand + localStorage

### Desktop Advantages
- **Keyboard shortcuts** — 1-4 select answers, Enter to check/continue, Space to flip flashcards, K for "know it", R for "study again"
- **Rich context panel** — 2-column layout with cultural notes, mnemonics, character breakdowns alongside answer feedback
- **Wider layouts** — sidebar navigation, right-side widgets

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| State | Zustand (persisted to localStorage) |
| Audio | ElevenLabs API + Web Speech API + Web Audio API |
| Font | Noto Sans Khmer (Google Fonts) |
| Icons | Lucide React |
| Confetti | react-confetti |

## Quick Start

```bash
cd khmerlingo
npm install

# Optional: add ElevenLabs API key for TTS
echo "ELEVENLABS_API_KEY=your-key-here" > .env.local

npm run dev
# Open http://localhost:3000
```

## Project Structure

```
khmerlingo/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Home — Skill tree + XP widget
│   │   ├── learn/[moduleId]/           # Quiz mode
│   │   ├── flashcards/[moduleId]/      # Flashcard study mode
│   │   ├── profile/                    # Stats, badges, progress
│   │   └── api/tts/route.ts            # ElevenLabs TTS proxy with caching
│   ├── components/
│   │   ├── flashcard/                  # FlashCard, FlashCardDeck
│   │   ├── home/                       # LessonPath, XPWidget
│   │   ├── layout/                     # Sidebar, MobileHeader
│   │   ├── lesson/                     # Quiz, Challenge, ChallengeCard, Footer, ResultScreen
│   │   └── ui/                         # Button, ConfettiBurst, ProgressBar
│   ├── data/
│   │   ├── modules.ts                  # 10 modules, 118 vocab, 100+ challenges (2200+ lines)
│   │   ├── cultural-context.ts         # Cultural notes for every vocab item (800 lines)
│   │   └── types.ts                    # TypeScript interfaces
│   ├── hooks/
│   │   └── use-keyboard-shortcuts.ts   # Quiz keyboard shortcuts
│   ├── lib/
│   │   ├── audio.ts                    # TTS, sound effects, preloading
│   │   ├── khmer-nlp.ts               # Tokenizer, romanizer, answer validator
│   │   └── utils.ts                    # cn(), formatXP(), getLevelFromXP()
│   └── store/
│       └── game-store.ts               # Zustand state (XP, hearts, streaks, badges)
├── tailwind.config.ts                  # Duolingo colors + custom animations
└── package.json
```

## Modules

| # | Module | Khmer | Items | Icon |
|---|--------|-------|-------|------|
| 1 | Greetings | ការស្វាគមន៍ | 12 | 👋 |
| 2 | Numbers | លេខ | 12 | 🔢 |
| 3 | Alphabet | អក្សរខ្មែរ | 12 | 📚 |
| 4 | Food & Drink | អាហារ | 12 | 🍜 |
| 5 | Family | គ្រួសារ | 12 | 👨‍👩‍👧 |
| 6 | Colors | ពណ៌ | 10 | 🎨 |
| 7 | Days & Time | ថ្ងៃ | 12 | 📅 |
| 8 | Body Parts | រាងកាយ | 12 | 🧍 |
| 9 | Places | ទីកន្លែង | 12 | 🏛️ |
| 10 | Common Phrases | ឃ្លាទូទៅ | 12 | 💬 |

## Design System

Inspired by Duolingo's proven UX patterns:

- **"3D press" buttons** — `border-b-4 active:border-b-2 active:translate-y-[2px]`
- **Color palette** — `#58CC02` green, `#1CB0F6` blue, `#E53838` red, `#FAA918` gold
- **Zigzag skill tree** — nodes alternate left-right with pulse animation on current
- **Noto Sans Khmer** — Google's complete Khmer Unicode font
- **Custom animations** — wiggle, bounce-in, shake, pop, heart-break keyframes

## Gamification Details

| Element | Details |
|---------|---------|
| XP | +10 per correct, level up every 100 XP |
| Hearts | 5 max, lose 1 per wrong answer, reset daily |
| Streaks | Tracks consecutive days, awards at 3 and 7 days |
| Gems | Starting balance 200, spendable on hints |
| Badges | First Steps, Friendly Greeter, Number Cruncher, Alphabet Master, Cambodian Foodie, Family Values, 3-Day Streak, Week Warrior, Khmer Graduate |

## NLP Utilities

```ts
import { normalizeKhmer, romanizeKhmer, validateAnswer, tokenizeKhmer } from '@/lib/khmer-nlp';

normalizeKhmer('ជំរាបសួរ')       // → normalized NFC form
romanizeKhmer('បាយ')              // → 'baay'
validateAnswer('hello', 'Hello')  // → true (case-insensitive)
tokenizeKhmer('ខ្ញុំចង់បាន')        // → ['ខ្ញុំ', 'ចង់', 'បាន']
```

## Data Sources

- **[dukkee/duolingo-ui](https://github.com/dukkee/duolingo-ui)** — Vue 3 UI recreation (design inspiration)
- **[sanidhyy/duolingo-clone](https://github.com/sanidhyy/duolingo-clone)** — Next.js 14 clone (component patterns)
- **[seanghay/awesome-khmer-language](https://github.com/seanghay/awesome-khmer-language)** — Khmer language resources
- **Khmer Unicode standard** — Authentic Unicode Khmer block (U+1780-U+17FF)

## Roadmap

- [ ] Speech recognition for speaking exercises
- [ ] Spaced repetition algorithm for flashcard scheduling
- [ ] More advanced grammar modules (sentence structure, particles)
- [ ] Community-contributed content via PRs
- [ ] PWA support for offline use
- [ ] iOS/Android via React Native port

## Contributing

Contributions welcome, especially:
1. **More vocabulary** — Edit `src/data/modules.ts`
2. **Cultural context** — Add to `src/data/cultural-context.ts`
3. **Native speaker review** — Verify translations and pronunciation guides
4. **New modules** — Follow existing pattern in the modules array
5. **Bug fixes** — Open a PR

## License

MIT

---

*"Learning Khmer connects you to 2,000 years of Cambodian civilization."*
*ការរៀនភាសាខ្មែរ ភ្ជាប់អ្នកទៅនឹងអរិយធម៌ខ្មែររាប់ពាន់ឆ្នាំ។*
