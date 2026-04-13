# PNW Camp Scout — Telegram Bot + Guided Filter Wizard

## Context

The CLI works but requires a terminal, Python knowledge, and API keys — zero friction for Robinson, zero chance for anyone else. The goal is a Telegram bot with a guided 8-step conversation wizard that any non-technical person can use: answer a few taps, get your top spots. Designed around Robinson's wife's use case — family of 4 + dogs + extended families, no camping BS, just the best answer right now.

Also adding missing data fields: **pet/dog-friendly**, **water nearby** (lake, river, ocean), **hiking trails nearby**, **group camping capacity** — because these are the first real questions any family asks.

---

## Files to Create / Modify

### New files
```
bots/telegram_bot.py       # Bot runner, message handling, sends results
bots/conversation.py       # State machine: 8-step filter wizard logic
SETUP.md                   # Dead-simple onboarding for non-technical users
```

### Modified files
```
data/schema.sql            # Add new columns to gem_profiles
data/seeds/pnw_gems.json   # Add pet_friendly, water_nearby, hiking fields to all 23 seeds
agents/classifier.py       # Expand Claude schema to extract new fields + save them
agents/orchestrator.py     # Add new filters to intent + _get_candidates()
config/prompts.yaml        # Update both prompts for new fields
requirements.txt           # Add python-telegram-bot>=20.0
```

---

## The Wizard: 8 Questions

Each step uses inline keyboard buttons. User never types a word.

```
Step 1: GROUP SIZE
  [Just us (1-2)] [Small group (3-6)] [Large family (7-15)] [Big reunion (15+)]

Step 2: DOGS COMING?
  [🐕 Yes, dogs!] [No pets]

Step 3: WHEN?
  [This weekend] [Next 2 weeks] [Next month] [I'm flexible]

Step 4: SCENERY VIBE
  [🌊 Beach/Ocean] [🌲 Old Growth Forest] [🏔️ Mountains/Alpine]
  [🏜️ High Desert] [🎲 Surprise me!]

Step 5: WATER?
  [🏊 Swimming lake] [🌊 Ocean beach] [🚣 River/creek] [Don't need it]

Step 6: HIKING NEARBY?
  [Yes, want trails] [Doesn't matter]

Step 7: CAMP STYLE?
  [🚽 Full campground (bathrooms, fire rings)] [🔥 Primitive (dispersed, raw)]
  [Either is fine]

Step 8: KIDS?
  [Yes, kid-friendly please] [No kids] [Either fine]

→ 🔍 Searching... (instant if cached, ~3s if scoring)

→ TOP 5 RESULTS as rich Telegram cards
```

**"Surprise me" 🎲** — at Step 4, if user taps this, skip remaining questions and go straight to a curated random pick from top-scored gems matching group size + dogs filter only.

---

## Result Card Format

Each result sent as one Telegram message per campsite:

```
🏕️ #1 — Hoh Rainforest Campground
⭐ Gem Score: 94/100 | 🏆 LEGENDARY

Olympic NP's deepest rainforest. Moss-draped maples and
Roosevelt elk wander through camp. Otherworldly.

📅 Best time: May–October
👨‍👩‍👧‍👦 Kid-friendly: ✅ | 🐕 Dogs: ✅ (on leash)
🚽 Bathrooms: Flush | 🛣️ Road: Paved
💧 Water: Hoh River (cold, no swimming)
🥾 Hiking: ✅ Hall of Mosses (1.2mi), Hoh River Trail
📶 Cell signal: None
🐻 Wildlife: Bears — bear canisters required

📣 Reddit this week: "Most magical place I've ever camped"
▶️ Top video: "Hoh Rainforest Camping" — 47k views

🔗 Book: recreation.gov/...
```

---

## New Data Fields

### `gem_profiles` table — new columns (migration SQL)
```sql
ALTER TABLE gem_profiles ADD COLUMN pet_friendly BOOLEAN;
ALTER TABLE gem_profiles ADD COLUMN dogs_on_leash_ok BOOLEAN;
ALTER TABLE gem_profiles ADD COLUMN water_nearby_type TEXT;   -- lake, river, ocean, hot_spring, none
ALTER TABLE gem_profiles ADD COLUMN water_swimmable BOOLEAN;
ALTER TABLE gem_profiles ADD COLUMN hiking_trails_nearby BOOLEAN;
ALTER TABLE gem_profiles ADD COLUMN hiking_trail_notes TEXT;
ALTER TABLE gem_profiles ADD COLUMN group_max_size INTEGER;
ALTER TABLE gem_profiles ADD COLUMN has_group_sites BOOLEAN;
```

### Updated Claude classifier schema (in `config/prompts.yaml`)
New fields added to the JSON schema:
```json
"pet_friendly": <bool>,
"dogs_on_leash_ok": <bool>,
"water_nearby_type": <"lake" | "river" | "ocean" | "hot_spring" | "none">,
"water_swimmable": <bool>,
"hiking_trails_nearby": <bool>,
"hiking_trail_notes": <string — top 1-2 trail names + distances>,
"group_max_size": <integer — max people this campground can comfortably host>,
"has_group_sites": <bool>
```

### Updated orchestrator intent (in `config/prompts.yaml`)
```json
"constraints": {
  "kid_friendly": bool or null,
  "pet_friendly": bool or null,
  "water_type": "lake" | "river" | "ocean" | null,
  "needs_hiking": bool or null,
  "group_size": integer or null,
  "no_reservations": bool,
  "hookups": bool
}
```

### Seed data additions (`data/seeds/pnw_gems.json`)
Add to each of the 23 seeds:
```json
"pet_friendly": true/false,
"water_nearby": "ocean" | "river" | "lake" | "hot_spring" | "none",
"water_swimmable": true/false,
"hiking_trails": true/false,
"max_group_size": integer
```

---

## Telegram Bot Architecture

### `bots/conversation.py` — State machine
```python
STEPS = ["group_size", "dogs", "when", "scenery", "water", "hiking", "camp_style", "kids"]

class CampSession:
    state: str          # current wizard step
    filters: dict       # accumulates answers
    user_id: int
    message_id: int     # for editing wizard message in place (cleaner UX)
```

### `bots/telegram_bot.py` — Handlers
```python
/start  → launches wizard (edit-in-place for each step)
/top    → top 5 highest gem scores right now (no wizard, instant)
/buzz   → recently chatted about on Reddit this week
/help   → what is this bot + quick guide

# Each inline keyboard button press → CallbackQueryHandler
# After step 8 → calls orchestrator.query(built_query) → sends 5 cards
```

### Query building from filters
```python
def build_query(filters: dict) -> str:
    # Converts structured filters → natural language for orchestrator
    # e.g., filters = {group_size: 8, dogs: True, water: "lake", kids: True}
    # → "family of 8 dog-friendly campsite with swimming lake kid-friendly"
```

---

## SETUP.md — Non-Technical User Guide

Three sections:

**For campers (Robinson's wife, siblings):**
```
1. Download Telegram (free — App Store or Google Play)
2. Search: @[botname]
3. Tap "Start"
4. Answer 8 quick questions by tapping buttons
5. Get your top camping spots!
```

**For Robinson (one-time setup, 10 min):**
```
1. Open Telegram → search @BotFather → tap Start
2. Type /newbot → follow prompts → copy the token
3. Paste into .env: TELEGRAM_BOT_TOKEN=your_token_here
4. In terminal: python bots/telegram_bot.py
5. Share @yourbotname with family
```

**To run 24/7 (Railway — free tier):**
```
1. railway.app → sign up → New Project → GitHub repo
2. Add .env variables in Railway dashboard
3. Deploy → bot stays on forever
```

---

## Implementation Notes

- **Edit in place**: Bot edits the same wizard message at each step — no chat spam
- **Speed**: `enrich=False` by default → uses cached gem scores → ~1-2 second response
- **🎲 Feeling lucky**: Weighted random from `gem_score >= 75`, filtered by dogs/group_size only
- **Large groups**: `group_size >= 7` auto-adds `has_group_sites` preference to query
- **Dogs**: Separate `pet_friendly` (allowed) vs `dogs_on_leash_ok` (truly dog-friendly with water/trails)
- **`/buzz` command**: `SELECT campsite_id FROM social_data WHERE scraped_at > (now - 7 days) GROUP BY campsite_id ORDER BY COUNT(*) DESC LIMIT 5`

---

## Verification

1. `python bots/telegram_bot.py` starts without error
2. `/start` → 8-step wizard with all buttons functional
3. Complete wizard → 5 result cards returned, each with water/hiking/dogs/group info
4. Dogs filter → no results have `pet_friendly = false`
5. Large family (15+) → only sites with group capacity
6. `/top` → instant top 5 gems with scores
7. `/buzz` → sites with recent Reddit activity
8. 🎲 Surprise me → skips to one gem result card
9. All 23 seed sites have pet/water/hiking fields populated
