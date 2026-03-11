import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useGameStore } from "./game-store";

export interface Profile {
  id: string;
  name: string;
  avatar: string; // emoji
  color: string; // hex color
}

interface ProfileState {
  activeProfileId: string;
  profiles: Profile[];
  setActiveProfile: (id: string) => void;
  updateProfileName: (id: string, name: string) => void;
  updateProfileAvatar: (id: string, avatar: string) => void;
}

const defaultProfiles: Profile[] = [
  { id: "profile-1", name: "Player 1", avatar: "🦊", color: "#58CC02" },
  { id: "profile-2", name: "Player 2", avatar: "🐬", color: "#1CB0F6" },
  { id: "profile-3", name: "Player 3", avatar: "🌟", color: "#FAA918" },
  { id: "profile-4", name: "Player 4", avatar: "🐲", color: "#E53838" },
];

// The key used by Zustand persist in game-store.ts
const GAME_STORE_KEY = "khmerlingo-game-store";

function getProfileGameKey(profileId: string) {
  return `khmerlingo-game-${profileId}`;
}

// Default game data for brand-new profiles
const freshGameData = {
  xp: 0,
  hearts: 5,
  maxHearts: 5,
  streak: 0,
  gems: 200,
  completedModules: [] as string[],
  legendaryModules: [] as string[],
  moduleProgress: {} as Record<string, number>,
  badges: [] as string[],
  lastPlayedDate: null as string | null,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      activeProfileId: "profile-1",
      profiles: defaultProfiles,

      setActiveProfile: (id: string) => {
        const oldId = get().activeProfileId;
        if (oldId === id) return; // already on this profile

        if (typeof window !== "undefined") {
          // ── Step 1: Save current game state to old profile's key ─────────
          // Read directly from localStorage (Zustand persist format)
          const currentGameJSON = localStorage.getItem(GAME_STORE_KEY);
          if (currentGameJSON) {
            localStorage.setItem(getProfileGameKey(oldId), currentGameJSON);
          }

          // ── Step 2: Load new profile's game state ────────────────────────
          const savedJSON = localStorage.getItem(getProfileGameKey(id));
          if (savedJSON) {
            try {
              const parsed = JSON.parse(savedJSON);
              // parsed has { state: {...}, version: 0 } shape from Zustand persist
              // Validate shape before merging — reject tampered / corrupt data
              const s = parsed?.state;
              if (s && typeof s === "object") {
                const safeState = {
                  xp: typeof s.xp === "number" && s.xp >= 0 ? s.xp : 0,
                  hearts: typeof s.hearts === "number" ? Math.min(Math.max(0, s.hearts), 5) : 5,
                  maxHearts: typeof s.maxHearts === "number" ? s.maxHearts : 5,
                  streak: typeof s.streak === "number" && s.streak >= 0 ? s.streak : 0,
                  gems: typeof s.gems === "number" && s.gems >= 0 ? s.gems : 0,
                  completedModules: Array.isArray(s.completedModules) ? s.completedModules.filter((m: unknown) => typeof m === "string") : [],
                  legendaryModules: Array.isArray(s.legendaryModules) ? s.legendaryModules.filter((m: unknown) => typeof m === "string") : [],
                  moduleProgress: s.moduleProgress && typeof s.moduleProgress === "object" && !Array.isArray(s.moduleProgress) ? s.moduleProgress : {},
                  badges: Array.isArray(s.badges) ? s.badges.filter((b: unknown) => typeof b === "string") : [],
                  lastPlayedDate: typeof s.lastPlayedDate === "string" || s.lastPlayedDate === null ? s.lastPlayedDate : null,
                };
                useGameStore.setState(safeState);
                const safeJSON = JSON.stringify({ state: safeState, version: 0 });
                localStorage.setItem(GAME_STORE_KEY, safeJSON);
              } else {
                useGameStore.setState(freshGameData);
              }
            } catch {
              // Corrupt data — reset to fresh
              useGameStore.setState(freshGameData);
            }
          } else {
            // Brand new profile — start fresh
            useGameStore.setState(freshGameData);
            // Write fresh state to main key
            const freshJSON = JSON.stringify({ state: freshGameData, version: 0 });
            localStorage.setItem(GAME_STORE_KEY, freshJSON);
          }
        }

        set({ activeProfileId: id });
      },

      updateProfileName: (id: string, name: string) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        }));
      },

      updateProfileAvatar: (id: string, avatar: string) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, avatar } : p
          ),
        }));
      },
    }),
    {
      name: "khmerlingo-profiles",
    }
  )
);
