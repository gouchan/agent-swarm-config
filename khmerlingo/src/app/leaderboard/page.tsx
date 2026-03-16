"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, Flame, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatXP } from "@/lib/utils";
import { useProfileStore } from "@/store/profile-store";
import { useGameStore } from "@/store/game-store";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";

// Default profiles metadata (colors)
const PROFILE_DEFAULTS = [
  { id: "profile-1", color: "#58CC02" },
  { id: "profile-2", color: "#1CB0F6" },
  { id: "profile-3", color: "#FAA918" },
  { id: "profile-4", color: "#E53838" },
];

interface ProfileStats {
  profileId: string;
  name: string;
  avatar: string;
  color: string;
  xp: number;
  streak: number;
  completedModules: number;
  legendaryModules: number;
  badges: number;
}

type TabKey = "xp" | "streak" | "modules";

function getProfileStats(profileId: string): Omit<ProfileStats, "name" | "avatar" | "color"> | null {
  if (typeof window === "undefined") return null;
  try {
    const json = localStorage.getItem(`khmerlingo-game-${profileId}`);
    if (!json) return null;
    const parsed = JSON.parse(json);
    const state = parsed.state;
    if (!state) return null;
    return {
      profileId,
      xp: state.xp ?? 0,
      streak: state.streak ?? 0,
      completedModules: (state.completedModules ?? []).length,
      legendaryModules: (state.legendaryModules ?? []).length,
      badges: (state.badges ?? []).length,
    };
  } catch {
    return null;
  }
}

const TAB_CONFIG: { key: TabKey; label: string; icon: React.ReactNode; getValue: (s: ProfileStats) => number; format: (v: number) => string; color: string }[] = [
  {
    key: "xp",
    label: "XP",
    icon: <Zap size={16} />,
    getValue: (s) => s.xp,
    format: (v) => `${formatXP(v)} XP`,
    color: "#FAA918",
  },
  {
    key: "streak",
    label: "Streak",
    icon: <Flame size={16} />,
    getValue: (s) => s.streak,
    format: (v) => `${v} days`,
    color: "#E53838",
  },
  {
    key: "modules",
    label: "Modules",
    icon: <BookOpen size={16} />,
    getValue: (s) => s.completedModules,
    format: (v) => `${v} done`,
    color: "#58CC02",
  },
];

export default function LeaderboardPage() {
  const { profiles, activeProfileId } = useProfileStore();
  const { xp, streak, completedModules, legendaryModules, badges } = useGameStore();
  const [allStats, setAllStats] = useState<ProfileStats[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("xp");

  // Load all profile stats from localStorage on mount + whenever active profile changes
  useEffect(() => {
    const stats: ProfileStats[] = [];
    for (const profile of profiles) {
      const defaults = PROFILE_DEFAULTS.find((d) => d.id === profile.id);
      if (profile.id === activeProfileId) {
        // Use live game store values for the active profile
        stats.push({
          profileId: profile.id,
          name: profile.name,
          avatar: profile.avatar,
          color: defaults?.color ?? profile.color,
          xp,
          streak,
          completedModules: completedModules.length,
          legendaryModules: legendaryModules?.length ?? 0,
          badges: badges.length,
        });
      } else {
        const gs = getProfileStats(profile.id);
        if (gs) {
          stats.push({
            ...gs,
            name: profile.name,
            avatar: profile.avatar,
            color: defaults?.color ?? profile.color,
          });
        } else {
          // Profile has never played
          stats.push({
            profileId: profile.id,
            name: profile.name,
            avatar: profile.avatar,
            color: defaults?.color ?? profile.color,
            xp: 0,
            streak: 0,
            completedModules: 0,
            legendaryModules: 0,
            badges: 0,
          });
        }
      }
    }
    setAllStats(stats);
  }, [activeProfileId, xp, streak, completedModules, legendaryModules, badges, profiles]);

  const tab = TAB_CONFIG.find((t) => t.key === activeTab)!;
  const sorted = [...allStats].sort((a, b) => tab.getValue(b) - tab.getValue(a));
  const myRank = sorted.findIndex((s) => s.profileId === activeProfileId) + 1;

  const RANK_ICONS = ["🥇", "🥈", "🥉", "4️⃣"];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <MobileHeader />
      <div className="flex-1 md:ml-64">
      <div className="mx-auto max-w-lg px-4 py-8 pt-20 md:pt-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="text-[#FAA918]" size={28} />
            <h1 className="text-2xl font-extrabold text-gray-800">Family Leaderboard</h1>
          </div>
          <p className="text-sm text-gray-500">See how your family is progressing</p>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 flex rounded-xl bg-gray-200 p-1 gap-1">
          {TAB_CONFIG.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-bold transition-all",
                activeTab === t.key
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Ranking list */}
        <div className="flex flex-col gap-3">
          {sorted.map((profile, index) => {
            const isMe = profile.profileId === activeProfileId;
            const score = tab.getValue(profile);
            const topScore = sorted.length > 0 ? (tab.getValue(sorted[0]) || 1) : 1;
            const pct = Math.max(8, (score / topScore) * 100);

            return (
              <motion.div
                key={profile.profileId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                className={cn(
                  "rounded-2xl bg-white px-4 py-3 shadow-sm border-2 transition-all",
                  isMe ? "border-transparent" : "border-gray-100"
                )}
                style={isMe ? { boxShadow: `0 0 0 2px ${profile.color}, 0 2px 8px rgba(0,0,0,0.06)` } : undefined}
              >
                <div className="flex items-center gap-3">
                  {/* Rank icon */}
                  <span className="text-xl w-7 text-center flex-shrink-0">
                    {RANK_ICONS[index] ?? `${index + 1}`}
                  </span>

                  {/* Avatar */}
                  <span
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl"
                    style={{
                      backgroundColor: profile.color + "22",
                      boxShadow: `0 0 0 2px ${profile.color}`,
                    }}
                  >
                    {profile.avatar}
                  </span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-gray-800 truncate">
                        {profile.name}
                        {isMe && (
                          <span className="ml-1.5 text-xs font-bold text-gray-400">(you)</span>
                        )}
                      </span>
                      <span
                        className="text-sm font-extrabold flex-shrink-0 ml-2"
                        style={{ color: tab.color }}
                      >
                        {tab.format(score)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: profile.color }}
                      />
                    </div>

                    {/* Sub-stats */}
                    <div className="mt-1 flex gap-3 text-[10px] text-gray-400 font-semibold">
                      <span>🏅 {profile.badges} badges</span>
                      <span>⚡ {profile.legendaryModules} legendary</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Your rank summary */}
        <div className="mt-6 rounded-xl bg-white px-4 py-3 text-center border-2 border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">
            Your rank:{" "}
            <span className="font-extrabold text-gray-800">
              {RANK_ICONS[myRank - 1] ?? `#${myRank}`} #{myRank} of {sorted.length}
            </span>
          </p>
          <Link
            href="/"
            className="mt-2 inline-block text-xs font-bold text-[#1CB0F6] hover:underline"
          >
            Keep practicing →
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
