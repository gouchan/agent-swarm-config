import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameState {
  xp: number;
  hearts: number;
  maxHearts: number;
  streak: number;
  gems: number; // "riels"
  completedModules: string[];
  legendaryModules: string[]; // modules completed in legendary mode
  moduleProgress: Record<string, number>; // moduleId -> challenge index
  badges: string[];
  lastPlayedDate: string | null;

  // Actions
  addXP: (amount: number) => void;
  loseHeart: () => void;
  gainHeart: () => void;
  completeModule: (moduleId: string) => void;
  completeLegendaryModule: (moduleId: string) => void;
  setModuleProgress: (moduleId: string, progress: number) => void;
  awardBadge: (badgeId: string) => void;
  updateStreak: () => void;
  spendGems: (amount: number) => boolean;
  resetHearts: () => void;
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      hearts: 5,
      maxHearts: 5,
      streak: 0,
      gems: 0,
      completedModules: [],
      legendaryModules: [],
      moduleProgress: {},
      badges: [],
      lastPlayedDate: null,

      addXP: (amount: number) => {
        set((state) => ({ xp: state.xp + amount }));
      },

      loseHeart: () => {
        set((state) => ({
          hearts: Math.max(0, state.hearts - 1),
        }));
      },

      gainHeart: () => {
        set((state) => ({
          hearts: Math.min(state.maxHearts, state.hearts + 1),
        }));
      },

      completeModule: (moduleId: string) => {
        const state = get();
        if (state.completedModules.includes(moduleId)) return;

        const newCompletedModules = [...state.completedModules, moduleId];

        // Award "first-lesson" badge when completing the first module
        const newBadges = [...state.badges];
        if (newCompletedModules.length === 1 && !newBadges.includes("first-lesson")) {
          newBadges.push("first-lesson");
        }

        set({
          completedModules: newCompletedModules,
          badges: newBadges,
        });
      },

      completeLegendaryModule: (moduleId: string) => {
        const state = get();
        if (state.legendaryModules.includes(moduleId)) return;
        const badgeId = `legendary-${moduleId}`;
        set((s) => ({
          legendaryModules: [...s.legendaryModules, moduleId],
          badges: s.badges.includes(badgeId) ? s.badges : [...s.badges, badgeId],
        }));
      },

      setModuleProgress: (moduleId: string, progress: number) => {
        set((state) => ({
          moduleProgress: {
            ...state.moduleProgress,
            [moduleId]: progress,
          },
        }));
      },

      awardBadge: (badgeId: string) => {
        set((state) => {
          if (state.badges.includes(badgeId)) return state;
          return { badges: [...state.badges, badgeId] };
        });
      },

      updateStreak: () => {
        const state = get();
        const today = getTodayDateString();
        const yesterday = getYesterdayDateString();

        if (state.lastPlayedDate === today) {
          // Already played today, streak unchanged
          return;
        }

        if (state.lastPlayedDate === yesterday) {
          // Played yesterday, increment streak
          set({
            streak: state.streak + 1,
            lastPlayedDate: today,
          });
        } else {
          // Missed a day or first time, reset streak to 1
          set({
            streak: 1,
            lastPlayedDate: today,
          });
        }
      },

      spendGems: (amount: number): boolean => {
        const state = get();
        if (state.gems < amount) return false;
        set({ gems: state.gems - amount });
        return true;
      },

      resetHearts: () => {
        set((state) => ({ hearts: state.maxHearts }));
      },
    }),
    {
      name: "khmerlingo-game-store",
      // Only persist to localStorage on client side
      skipHydration: false,
    }
  )
);
