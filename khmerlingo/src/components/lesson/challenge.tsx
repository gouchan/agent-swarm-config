"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChallengeCard } from "./challenge-card";
import type { Challenge as ChallengeType } from "@/data/types";

interface ChallengeProps {
  challenge: ChallengeType;
  selectedOptionId: string | null;
  status: "none" | "correct" | "wrong";
  onSelect: (id: string) => void;
}

export function Challenge({
  challenge,
  selectedOptionId,
  status,
  onSelect,
}: ChallengeProps) {
  const isSelectType = challenge.type === "SELECT";
  const isAssistType = challenge.type === "ASSIST";

  return (
    <div className="flex flex-col items-center px-4 py-6">
      {/* Question */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-bold text-gray-700">
          {challenge.questionText}
        </h2>
        {challenge.questionKhmer && (
          <p className="mt-2 text-3xl font-bold text-gray-800">
            {challenge.questionKhmer}
          </p>
        )}
        {challenge.hint && (
          <p className="mt-2 text-sm text-gray-400">{challenge.hint}</p>
        )}
      </motion.div>

      {/* Options Grid */}
      <div
        className={cn(
          "w-full max-w-lg gap-3",
          isAssistType ? "flex flex-col" : "grid grid-cols-2"
        )}
      >
        {challenge.options.map((option, index) => {
          const optionStatus: "none" | "correct" | "wrong" =
            status === "none"
              ? "none"
              : option.id === selectedOptionId
              ? option.isCorrect
                ? "correct"
                : "wrong"
              : option.isCorrect && status === "wrong"
              ? "correct"
              : "none";

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              <ChallengeCard
                text={option.text}
                selected={option.id === selectedOptionId}
                status={optionStatus}
                onClick={() => onSelect(option.id)}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
