"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { LessonPath } from "@/components/home/lesson-path";
import { XPWidget } from "@/components/home/xp-widget";
import { useGameStore } from "@/store/game-store";
import { modules } from "@/data/modules";
import { useEffect } from "react";

export default function HomePage() {
  const { completedModules, updateStreak } = useGameStore();

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  // Determine current module index (first non-completed)
  const currentModuleIndex = Math.min(
    completedModules.length,
    modules.length - 1
  );

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center md:ml-64 pt-16 md:pt-0">
        <div className="w-full max-w-2xl px-4 py-8 flex gap-6">
          {/* Skill Tree / Lesson Path */}
          <div className="flex-1">
            {/* Hero Banner */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#58CC02] to-[#46A302] text-white shadow-lg">
              <div className="flex items-center gap-4">
                <span className="text-5xl">🇰🇭</span>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-wide">
                    Khmer Course
                  </h1>
                  <p className="text-green-100 mt-1 text-sm font-medium">
                    ភាសាខ្មែរ · {modules.length} units · Beginner
                  </p>
                  <p className="text-white/80 text-xs mt-1">
                    The only app for learning Cambodian Khmer
                  </p>
                </div>
              </div>
            </div>

            <LessonPath
              modules={modules}
              completedModules={completedModules}
              currentModuleIndex={currentModuleIndex}
            />
          </div>

          {/* Desktop Right Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-4">
              <XPWidget />
              <DailyGoalCard />
              <AboutKhmerCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DailyGoalCard() {
  const { xp } = useGameStore();
  const dailyGoal = 50;
  const todayXP = Math.min(xp % 100, dailyGoal); // simplified daily tracking
  const pct = Math.min((todayXP / dailyGoal) * 100, 100);

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
      <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
        <span>🎯</span> Daily Goal
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>{todayXP} XP earned</span>
          <span>{dailyGoal} XP goal</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-[#58CC02] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-slate-400">
          {pct >= 100 ? "🎉 Goal reached!" : `${dailyGoal - todayXP} XP to go`}
        </p>
      </div>
    </div>
  );
}

function AboutKhmerCard() {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
      <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
        <span>📖</span> Did you know?
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed">
        Khmer script is one of the oldest writing systems in Southeast Asia,
        dating back to the 7th century AD. Cambodia&apos;s Angkor Wat temples
        are inscribed with this beautiful script.
      </p>
      <p className="text-xs text-slate-400 mt-2">
        ~16 million speakers worldwide
      </p>
    </div>
  );
}
