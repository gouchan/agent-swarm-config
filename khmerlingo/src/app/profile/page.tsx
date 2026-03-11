"use client";

import Link from "next/link";
import { ArrowLeft, Flame, Zap, Heart, Gem, Trophy } from "lucide-react";
import { useGameStore } from "@/store/game-store";
import { BADGES } from "@/data/types";
import { modules } from "@/data/modules";
import { getLevelFromXP, getXPForNextLevel } from "@/lib/utils";
import { DidYouKnow } from "@/components/ui/did-you-know";

export default function ProfilePage() {
  const { xp, hearts, streak, gems, completedModules, badges } =
    useGameStore();

  const level = getLevelFromXP(xp);
  const xpToNext = getXPForNextLevel(xp);
  const levelProgress = ((xp % 100) / 100) * 100;

  const earnedBadges = BADGES.filter((b) => badges.includes(b.id));
  const unearnedBadges = BADGES.filter((b) => !badges.includes(b.id));

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Did You Know */}
        <DidYouKnow className="mb-6" />

        {/* Level Card */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#58CC02] to-[#46A302] flex items-center justify-center text-3xl font-extrabold text-white shadow-md">
              {level}
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Your Level</p>
              <p className="text-2xl font-extrabold text-slate-800">
                Level {level}
              </p>
              <p className="text-xs text-slate-400">{xpToNext} XP to Level {level + 1}</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-[#58CC02] rounded-full transition-all duration-700"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1 text-right">{xp} XP total</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Flame className="h-6 w-6 text-orange-500" />}
            label="Day Streak"
            value={streak}
            bg="bg-orange-50"
            border="border-orange-200"
          />
          <StatCard
            icon={<Zap className="h-6 w-6 text-yellow-500" />}
            label="Total XP"
            value={xp}
            bg="bg-yellow-50"
            border="border-yellow-200"
          />
          <StatCard
            icon={<Heart className="h-6 w-6 text-rose-500" />}
            label="Hearts"
            value={`${hearts}/5`}
            bg="bg-rose-50"
            border="border-rose-200"
          />
          <StatCard
            icon={<Gem className="h-6 w-6 text-blue-500" />}
            label="Gems"
            value={gems}
            bg="bg-blue-50"
            border="border-blue-200"
          />
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Course Progress
          </h2>
          <div className="space-y-3">
            {modules.map((mod) => {
              const done = completedModules.includes(mod.id);
              return (
                <div key={mod.id} className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">{mod.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700">
                        {mod.title}
                      </span>
                      {done && (
                        <span className="text-xs text-green-600 font-bold">
                          ✓ Done
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-full bg-[#58CC02] rounded-full transition-all"
                        style={{ width: done ? "100%" : "0%" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-slate-500 mt-4 text-center">
            {completedModules.length}/{modules.length} units completed
          </p>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4">
            Badges ({earnedBadges.length}/{BADGES.length})
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center text-center p-3 bg-yellow-50 rounded-xl border-2 border-yellow-200"
              >
                <span className="text-3xl mb-1">{badge.icon}</span>
                <p className="text-xs font-bold text-slate-700">{badge.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{badge.description}</p>
              </div>
            ))}
            {unearnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl border-2 border-slate-200 opacity-40 grayscale"
              >
                <span className="text-3xl mb-1">{badge.icon}</span>
                <p className="text-xs font-bold text-slate-500">{badge.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{badge.condition}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back to learning */}
        <Link
          href="/"
          className="block w-full text-center py-4 bg-[#58CC02] text-white font-bold rounded-2xl border-b-4 border-[#46A302] hover:bg-[#46A302] transition-colors"
        >
          Continue Learning 🇰🇭
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
  border,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bg: string;
  border: string;
}) {
  return (
    <div
      className={`${bg} ${border} border-2 rounded-2xl p-4 flex flex-col items-center gap-2`}
    >
      {icon}
      <p className="text-2xl font-extrabold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
    </div>
  );
}
