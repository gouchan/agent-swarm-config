"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChallengeCardProps {
  text: string;
  khmerText?: string;
  selected: boolean;
  status: "none" | "correct" | "wrong";
  onClick: () => void;
}

export function ChallengeCard({
  text,
  khmerText,
  selected,
  status,
  onClick,
}: ChallengeCardProps) {
  const borderColor =
    status === "correct"
      ? "border-green-300"
      : status === "wrong"
      ? "border-rose-300"
      : selected
      ? "border-sky-300"
      : "border-slate-200";

  const bgColor =
    status === "correct"
      ? "bg-green-100"
      : status === "wrong"
      ? "bg-rose-100"
      : selected
      ? "bg-sky-100"
      : "bg-white";

  const isDisabled = status === "correct" || status === "wrong";

  return (
    <motion.button
      onClick={isDisabled ? undefined : onClick}
      className={cn(
        "relative w-full rounded-xl border-2 border-b-4 p-4 text-left transition-all",
        "active:border-b-2 active:translate-y-[2px]",
        borderColor,
        bgColor,
        isDisabled ? "cursor-default" : "cursor-pointer hover:bg-gray-50"
      )}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {khmerText && (
        <p className="mb-1 text-2xl font-bold text-gray-800">{khmerText}</p>
      )}
      <p
        className={cn(
          "font-semibold",
          khmerText ? "text-sm text-gray-500" : "text-lg text-gray-800"
        )}
      >
        {text}
      </p>

      {/* Status icons */}
      {status === "correct" && (
        <span className="absolute right-3 top-3 text-[#58CC02] text-xl">
          ✓
        </span>
      )}
      {status === "wrong" && (
        <span className="absolute right-3 top-3 text-[#E53838] text-xl">
          ✗
        </span>
      )}
    </motion.button>
  );
}
