# 🎨 HAUNT AND SEEK - POLISH & ASSET UPDATE GUIDE

**Last Updated:** January 13, 2026

---

## ✅ COMPLETED AUTO-SETUP

### **1. Horror Lighting** - DONE ✨
**What was applied:**
- Very dark ambient lighting (RGB 10,10,15)
- Thick volumetric fog (Atmosphere object)
- Desaturated color correction (black & white-ish)
- Strong bloom on light sources (flashlights glow)
- Dynamic shadows enabled
- Claustrophobic fog distance (150 studs)
- Cool blue-purple tint

**Result:** Dark, oppressive horror atmosphere automatically applied!

### **2. Centralized Asset Config** - DONE 📁
**Location:** `ServerScriptService/AssetConfig.lua`

All asset IDs are now in ONE place:
- 50+ sound effect slots
- 14 item icon slots
- 10+ particle texture slots
- VFX presets (colors, sizes, lifetimes)

**Result:** Update assets in ONE file, changes apply game-wide!

### **3. Enhanced VFX System** - DONE ✨
**New function:** `createVFXEffect(position, presetName, texture, duration)`

Presets available:
- `"fear"` - Dark purple wisps
- `"ghost"` - Pale blue ethereal
- `"possession"` - Dark red aura
- `"heal"` - Green sparkles

**Result:** Easy-to-use VFX system ready for particle textures!

### **4. Sound System** - DONE 🔊
**Updated:** PolishEffects.lua now uses AssetConfig.Sounds

All scripts use centralized sound IDs automatically!

---

## 🚀 HOW TO UPDATE ASSETS (STEP-BY-STEP)

### **STEP 1: Find Free Sounds**

1. Open Roblox Studio
2. Go to: https://create.roblox.com/store/audio
3. Filter: **Free** + **Sound Effects** + search "horror"
4. Preview sounds, find ones you like
5. Click on a sound → Copy the asset ID from URL
   - Example URL: `create.roblox.com/store/asset/1234567890/sound`
   - Asset ID: `1234567890`

**Recommended searches:**
- "heartbeat"
- "breathing heavy"
- "whisper creepy"
- "scream horror"
- "footstep wood"
- "door creak"

### **STEP 2: Update Sound IDs**

1. In Roblox Studio, open `ServerScriptService/AssetConfig`
2. Find the sound you want to replace (e.g., `heartbeat`, `scream`, `footstepWood`)
3. Replace the number in `"rbxassetid://NUMBER"`
   ```lua
   -- BEFORE:
   heartbeat = "rbxassetid://0", -- TODO: Heartbeat when scared

   -- AFTER (example):
   heartbeat = "rbxassetid://9125402735", -- Heartbeat when scared
   ```
4. Save the file
5. Test in game!

**High Priority Sounds:**
- `heartbeat` - Plays when survivor has high fear
- `breathing` - Heavy breathing sound
- `jumpscare` - Loud stinger for scares
- `footstepWood/Tile/Carpet` - Walking sounds
- `ghostAppear` - When ghost teleports near you

---

### **STEP 3: Find Free Particle Textures**

**Option A - CIX Library Plugin (RECOMMENDED):**
1. Go to DevForum: https://devforum.roblox.com/t/over-600-free-particle-with-cix-library-a-particle-library-plugin/2864815
2. Install the CIX Library plugin
3. Open plugin in Roblox Studio
4. Browse 600+ particle textures
5. Find textures for:
   - Dark wisps (for fear effects)
   - Smoke (for smudge sticks)
   - Ethereal effects (for ghost)
   - Sparkles (for healing, teleport)
6. Copy texture asset IDs

**Option B - Creator Store:**
1. Search Creator Store for "particle texture"
2. Filter by: Free
3. Preview textures
4. Copy asset IDs

### **STEP 4: Update Particle Textures**

1. Open `ServerScriptService/AssetConfig`
2. Find `AssetConfig.ParticleTextures`
3. Replace texture IDs:
   ```lua
   -- BEFORE:
   darkWisp = "rbxasset://textures/particles/smoke_main.dds",

   -- AFTER (example with free texture):
   darkWisp = "rbxassetid://1234567890",
   ```

**High Priority Textures:**
- `darkWisp` - Fear vignette particles
- `ghostTrail` - Ethereal trail when ghost moves
- `possessionAura` - Evil red aura
- `teleportEffect` - Ghost teleport sparkles

---

### **STEP 5: Find Free UI Icons**

**Option A - Interface Tools Plugin:**
1. Install from: https://devforum.roblox.com/t/plugin-interface-tools/404423
2. Open plugin in Studio
3. Browse hundreds of icons
4. Find icons for items (medkit, flashlight, phone, etc.)

**Option B - Free Icon Packs:**
1. BuiltByBit: https://builtbybit.com/resources/free-icon-pack.54420/
2. Download 736 free icons
3. Upload to Roblox (requires 13+ and ID verified)
4. Get decal asset IDs

**Option C - Royalty-Free Icon Sites:**
1. The Noun Project: https://thenounproject.com
2. Flaticon: https://www.flaticon.com
3. Download icons (PNG format)
4. Upload to Roblox as Decals
5. Copy decal asset IDs

### **STEP 6: Update Item Icons**

1. Open `ServerScriptService/AssetConfig`
2. Find `AssetConfig.ItemIcons`
3. Replace icon IDs:
   ```lua
   -- BEFORE:
   firstAidKit = "rbxassetid://0", -- TODO: Medkit icon

   -- AFTER (example):
   firstAidKit = "rbxassetid://1234567890", -- Medkit icon
   ```

**All 14 Items Need Icons:**
- firstAidKit, bandage, adrenalineShot
- flashlightBattery, glowStick, uvLight
- walkieTalkie, smartphone
- saltPouch, crucifix, smudgeStick
- emfReader, spiritBox
- diaryPage

---

## 📋 QUICK CHECKLIST

### Lighting (AUTO-DONE)
- [x] Dark horror atmosphere
- [x] Volumetric fog
- [x] Color correction (desaturated)
- [x] Bloom on lights
- [x] Dynamic shadows

### Sounds (NEEDS YOUR ASSET IDs)
Priority sounds to find:
- [ ] Heartbeat (when scared)
- [ ] Heavy breathing
- [ ] Jumpscare stinger
- [ ] Ghost whispers
- [ ] Scream
- [ ] Footsteps (wood, tile, carpet)
- [ ] Door creaks
- [ ] Item pickup sound
- [ ] Teleport whoosh
- [ ] Possession sound

### VFX Particles (NEEDS YOUR TEXTURES)
Priority textures to find:
- [ ] Dark wispy smoke (fear effects)
- [ ] Ethereal ghost trail
- [ ] Possession red aura
- [ ] Sparkles (healing, teleport)
- [ ] Fog/mist (fear fog trap)

### UI Icons (NEEDS YOUR ICONS)
All 14 item icons:
- [ ] First aid kit
- [ ] Bandage
- [ ] Adrenaline shot
- [ ] Flashlight battery
- [ ] Glow stick
- [ ] UV light
- [ ] Walkie-talkie
- [ ] Smartphone
- [ ] Salt pouch
- [ ] Crucifix
- [ ] Smudge stick
- [ ] EMF reader
- [ ] Spirit box
- [ ] Diary page

---

## 🎯 TESTING YOUR ASSETS

After updating asset IDs in `AssetConfig.lua`:

1. **Save the file** in Roblox Studio
2. **Run the game** (F5 or Play button)
3. **Test specific sounds:**
   - Fear sounds: Let ghost get close to you
   - Item pickup: Walk over item spawns
   - UI sounds: Open inventory
4. **Test VFX:**
   - Fear effects: Get scared
   - Ghost effects: Play as ghost, teleport
   - Item effects: Use healing items
5. **Check console** for "[Polish]" messages

---

## 💡 PRO TIPS

### Sound Tips:
- Use short sounds (<10 seconds) for instant effects
- Use looped sounds for ambience
- Keep volume around 0.3-0.7 (not too loud)
- Test in-game with headphones for best effect

### Particle Tips:
- Use transparent textures (PNG with alpha)
- Dark colors for horror (black, purple, red)
- Subtle effects > over-the-top
- Test with lighting to see how particles look in dark

### Icon Tips:
- Use 256x256 or 512x512 resolution
- Simple, clear designs (readable when small)
- Consistent art style across all icons
- White/light colors show up better on dark UI

---

## 🔗 USEFUL LINKS

**Official Roblox Resources:**
- Creator Store Audio: https://create.roblox.com/store/audio
- Creator Store Images: https://create.roblox.com/store/images
- Roblox Documentation: https://create.roblox.com/docs

**Community Resources:**
- Free Horror SFX DevForum: https://devforum.roblox.com/t/free-horror-sfx-for-games-by-me/1399778
- CIX Library (600+ Particles): https://devforum.roblox.com/t/over-600-free-particle-with-cix-library-a-particle-library-plugin/2864815
- Interface Tools Plugin: https://devforum.roblox.com/t/plugin-interface-tools/404423
- BuiltByBit Free Icons: https://builtbybit.com/resources/free-icon-pack.54420/

**Horror Lighting Guides:**
- Horror Game Guide: https://darkskiesfilm.com/how-to-make-a-horror-game-in-roblox-studio/
- Community Lighting Tips: https://devforum.roblox.com/t/horror-game-lighting/1086876

---

## ❓ TROUBLESHOOTING

**Sound not playing?**
- Check if asset ID is correct (must be a Sound, not Music)
- Verify sound is published and free to use
- Check Volume is not 0
- Look for errors in Output console

**Particles not showing?**
- Check texture asset ID is correct
- Verify particle Enabled = true
- Check Rate > 0 and Lifetime > 0
- Test in dark areas (some effects only visible in dark)

**Icons not showing?**
- Must use Image/Decal asset IDs (not Model IDs)
- Verify asset is published as Decal
- Check ImageLabel.Image property is set correctly

**Need help?**
Check console output for "[Polish]" messages - they show what's loading!

---

**END OF GUIDE**
*Update this file as you find and add new assets!*
