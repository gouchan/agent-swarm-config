"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ConfettiBurst } from "@/components/ui/confetti-burst";

interface ResultScreenProps {
  xpEarned: number;
  heartsLeft: number;
  totalChallenges: number;
  correctCount: number;
  onContinue: () => void;
}

export function ResultScreen({
  xpEarned,
  heartsLeft,
  totalChallenges,
  correctCount,
  onContinue,
}: ResultScreenProps) {
  const accuracy =
    totalChallenges > 0
      ? Math.round((correctCount / totalChallenges) * 100)
      : 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <ConfettiBurst />

      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Trophy */}
        <motion.span
          className="text-7xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          🏆
        </motion.span>

        <h1 className="mt-4 text-3xl font-extrabold text-gray-800">
          Lesson Complete!
        </h1>

        {/* Stats Grid */}
        <div className="mt-8 grid w-full max-w-sm grid-cols-2 gap-4">
          {/* XP Earned */}
          <motion.div
            className="flex flex-col items-center rounded-2xl bg-yellow-50 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-3xl">⚡</span>
            <span className="mt-1 text-2xl font-extrabold text-[#FAA918]">
              {xpEarned}
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-yellow-600">
              XP Earned
            </span>
          </motion.div>

          {/* Accuracy */}
          <motion.div
            className="flex flex-col items-center rounded-2xl bg-green-50 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-3xl">🎯</span>
            <span className="mt-1 text-2xl font-extrabold text-[#58CC02]">
              {accuracy}%
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-green-600">
              Accuracy
            </span>
          </motion.div>

          {/* Hearts Left */}
          <motion.div
            className="flex flex-col items-center rounded-2xl bg-red-50 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-3xl">❤️</span>
            <span className="mt-1 text-2xl font-extrabold text-[#E53838]">
              {heartsLeft}
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-red-500">
              Hearts Left
            </span>
          </motion.div>

          {/* Score */}
          <motion.div
            className="flex flex-col items-center rounded-2xl bg-blue-50 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-3xl">✅</span>
            <span className="mt-1 text-2xl font-extrabold text-[#1CB0F6]">
              {correctCount}/{totalChallenges}
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-blue-500">
              Correct
            </span>
          </motion.div>
        </div>

        {/* Continue Button */}
        <motion.div
          className="mt-8 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            variant="default"
            size="lg"
            onClick={onContinue}
            className="w-full text-base"
          >
            Continue to Home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
