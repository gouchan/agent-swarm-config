# KhmerLingo 🇰🇭

**The first Duolingo-style app for learning the Khmer (Cambodian) language.**

Khmer is spoken by ~16 million people and is absent from Duolingo. KhmerLingo fills that gap with gamified, beginner-friendly lessons using real Unicode Khmer script (ខ្មែរ).

```
┌─────────────────────────────────────────────────────────────┐
│                  KHMERLINGO                                  │
│                                                             │
│   🇰🇭  Learn Khmer • ភាសាខ្មែរ • Free & Open Source        │
│                                                             │
│   10 Modules • 100+ Vocabulary • Gamified • Mobile-Ready    │
└─────────────────────────────────────────────────────────────┘
```

## Features

- **10 Beginner Modules** — Greetings, Numbers, Alphabet, Food, Family, Colors, Days, Body Parts, Places, Common Phrases
- **Real Khmer Script** — All content uses authentic Unicode Khmer (U+1780–U+17FF) rendered with Noto Sans Khmer font
- **Gamification** — XP points, hearts/lives, daily streaks, unlockable badges, gem currency
- **Skill Tree** — Sequential lesson unlock (Duolingo-style zigzag path)
- **Multiple Exercise Types** — SELECT (Khmer → English), ASSIST (English → Khmer), MATCH, FILL_BLANK
- **Persistent Progress** — localStorage-based game state via Zustand
- **Animations** — Framer Motion transitions, confetti on lesson completion
- **Pronunciation Guides** — Romanized pronunciation for every vocabulary item
- **Responsive** — Desktop sidebar + mobile header layout

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| State | Zustand + localStorage |
| Font | Noto Sans Khmer (Google Fonts) |
| Icons | Lucide React |
| Confetti | react-confetti |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
open http://localhost:3000
```

## Project Structure

```
khmerlingo/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + fonts
│   │   ├── page.tsx                # Home — Skill tree
│   │   ├── learn/[moduleId]/       # Lesson quiz page
│   │   └── profile/                # Stats, badges, progress
│   ├── components/
│   │   ├── ui/                     # button, progress-bar, heart, confetti
│   │   ├── layout/                 # sidebar, mobile-header, page-wrapper
│   │   ├── home/                   # lesson-path, unit-banner, xp-widget
│   │   └── lesson/                 # quiz, challenge, challenge-card, header, footer, result-screen
│   ├── data/
│   │   ├── types.ts                # TypeScript interfaces + Badge definitions
│   │   └── modules.ts              # All 10 modules (vocab + challenges)
│   ├── store/
│   │   └── game-store.ts           # Zustand game state with persistence
│   └── lib/
│       ├── utils.ts                # cn(), formatXP(), shuffleArray()
│       └── khmer-nlp.ts            # Khmer tokenizer, romanizer, answer validator
└── public/
```

## Modules

| # | Module | Khmer | Items |
|---|--------|-------|-------|
| 1 | Greetings | ការស្វាគមន៍ | ជំរាបសួរ, សួស្តី, អរគុណ… |
| 2 | Numbers | លេខ | មួយ, ពីរ, បី, ដប់… |
| 3 | Alphabet | អក្សរខ្មែរ | ក, ខ, គ, ឃ, ង… |
| 4 | Food & Drink | អាហារ | បាយ, ទឹក, ត្រី, គុយទាវ… |
| 5 | Family | គ្រួសារ | ម្តាយ, ឪពុក, បងប្រុស… |
| 6 | Colors | ពណ៌ | ក្រហម, ខៀវ, លឿង… |
| 7 | Days & Time | ថ្ងៃ | ថ្ងៃចន្ទ, ព្រឹក, យប់… |
| 8 | Body Parts | រាងកាយ | ក្បាល, ភ្នែក, ដៃ… |
| 9 | Places | ទីកន្លែង | ផ្ទះ, ផ្សារ, វត្ត… |
| 10 | Common Phrases | ឃ្លាទូទៅ | ខ្ញុំ, អ្នក, ជួយខ្ញុំ… |

## Gamification

| Element | Details |
|---------|---------|
| ⚡ XP | +10 per correct answer, +50 bonus per completed lesson |
| ❤️ Hearts | 5 max, lose 1 per wrong answer |
| 🔥 Streak | Tracks consecutive days of learning |
| 💎 Gems | Currency for hints (starts at 200) |
| 🏅 Badges | 9 unlockable badges (First Steps → Khmer Graduate) |

## NLP Utilities (`src/lib/khmer-nlp.ts`)

```ts
import { normalizeKhmer, romanizeKhmer, validateAnswer, tokenizeKhmer } from '@/lib/khmer-nlp';

// Normalize Unicode Khmer
normalizeKhmer('ជំរាបសួរ') // → normalized NFC form

// Get pronunciation guide
romanizeKhmer('បាយ') // → 'baay'

// Validate user answers (case-insensitive, trimmed)
validateAnswer('hello', 'Hello') // → true

// Tokenize Khmer text into syllables
tokenizeKhmer('ខ្ញុំចង់បាន') // → ['ខ្ញុំ', 'ចង់', 'បាន']
```

## Data Sources & Inspiration

This project integrates patterns from:
- **[dukkee/duolingo-ui](https://github.com/dukkee/duolingo-ui)** — Vue 3 Duolingo UI recreation (design inspiration)
- **[sanidhyy/duolingo-clone](https://github.com/sanidhyy/duolingo-clone)** — Next.js 14 Duolingo clone (component patterns)
- **[seanghay/awesome-khmer-language](https://github.com/seanghay/awesome-khmer-language)** — Khmer language resource collection
- **[phylypo/khmer-text-data](https://github.com/phylypo/khmer-text-data)** — Khmer text corpora
- **[VietHoang1512/khmer-nltk](https://github.com/VietHoang1512/khmer-nltk)** — Khmer NLP toolkit
- **Khmer Unicode standard** — Content uses authentic Unicode Khmer block (U+1780–U+17FF)

## Roadmap

- [ ] Audio playback for pronunciation (Web Speech API / TTS)
- [ ] Speech recognition for speaking exercises
- [ ] More advanced grammar modules (sentence structure)
- [ ] Flashcard review mode (spaced repetition)
- [ ] Community-contributed content via GitHub PRs
- [ ] PWA support for offline use
- [ ] iOS/Android via React Native port (see `pedro-rivas/duolingo-clone` for RN base)

## Contributing

Contributions welcome! Especially:
1. **More vocabulary** — Edit `src/data/modules.ts`
2. **Audio files** — Add `.mp3` pronunciation to `/public/sounds/`
3. **Bug fixes** — Open a PR
4. **New modules** — Add to the `modules` array following the existing pattern

## License

MIT — Free to use, fork, and build upon.

---

*"Learning Khmer connects you to 2,000 years of Cambodian civilization."*
*ការរៀនភាសាខ្មែរ ភ្ជាប់អ្នកទៅនឹងអរិយធម៌ខ្មែររាប់ពាន់ឆ្នាំ។*
