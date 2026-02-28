"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/store/game-store";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatXP } from "@/lib/utils";

export function XPWidget() {
  const { xp, streak } = useGameStore();
  const dailyGoal = 50;
  // Use a simple modular daily progress: xp mod dailyGoal
  const dailyProgress = Math.min(100, ((xp % dailyGoal) / dailyGoal) * 100);
  const dailyXPCurrent = xp % dailyGoal;

  return (
    <motion.div
      className="rounded-2xl border-2 border-gray-200 bg-white p-5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Daily Goal */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            Daily Goal
          </h3>
          <span className="text-sm font-bold text-[#FAA918]">
            {dailyXPCurrent}/{dailyGoal} XP
          </span>
        </div>
        <ProgressBar value={dailyProgress} />
      </div>

      {/* Streak */}
      <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-4">
        <motion.span
          className="text-4xl"
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          🔥
        </motion.span>
        <div>
          <p className="text-2xl font-extrabold text-orange-500">{streak}</p>
          <p className="text-xs font-bold text-orange-400">
            {streak === 1 ? "day streak" : "day streak"}
          </p>
        </div>
      </div>

      {/* Total XP */}
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-yellow-50 p-4">
        <span className="text-4xl">⚡</span>
        <div>
          <p className="text-2xl font-extrabold text-[#FAA918]">
            {formatXP(xp)}
          </p>
          <p className="text-xs font-bold text-yellow-500">Total XP</p>
        </div>
      </div>
    </motion.div>
  );
}
