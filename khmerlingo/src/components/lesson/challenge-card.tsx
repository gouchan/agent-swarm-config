"use client";

import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakText, speakKhmer } from "@/lib/audio";

interface ChallengeCardProps {
  text: string;
  khmerText?: string;
  romanized?: string;
  illustration?: string;   // Emoji illustration
  selected: boolean;
  status: "none" | "correct" | "wrong" | "try-again";
  onClick: () => void;
  keyboardHint?: string;   // "1", "2", "3", "4"
  showIllustration?: boolean;
}

export function ChallengeCard({
  text,
  khmerText,
  romanized,
  illustration,
  selected,
  status,
  onClick,
  keyboardHint,
  showIllustration = true,
}: ChallengeCardProps) {
  // try-again is NOT disabled — user can still select another card
  const isDisabled = status === "correct" || status === "wrong";
  const isTryAgain = status === "try-again";

  const borderColor = isDisabled
    ? status === "correct"
      ? "border-green-400"
      : "border-rose-400"
    : isTryAgain
    ? "border-amber-400"
    : selected
    ? "border-[#1CB0F6]"
    : "border-slate-200 hover:border-slate-300";

  const bgColor = isDisabled
    ? status === "correct"
      ? "bg-green-50"
      : "bg-rose-50"
    : isTryAgain
    ? "bg-amber-50"
    : selected
    ? "bg-[#DDF4FF]"
    : "bg-white hover:bg-slate-50";

  const textColor = isDisabled
    ? status === "correct"
      ? "text-green-700"
      : "text-rose-700"
    : isTryAgain
    ? "text-amber-700"
    : selected
    ? "text-[#1CB0F6]"
    : "text-slate-700";

  const illustrationBg = isDisabled
    ? status === "correct"
      ? "bg-green-100"
      : "bg-rose-100"
    : isTryAgain
    ? "bg-amber-100"
    : selected
    ? "bg-[#BEE9FF]"
    : "bg-slate-100";

  function handleAudio(e: React.MouseEvent) {
    e.stopPropagation();
    if (khmerText) {
      speakKhmer(khmerText);
    } else {
      speakText(text);
    }
  }

  return (
    <motion.button
      onClick={isDisabled ? undefined : onClick}
      className={cn(
        "relative w-full rounded-2xl border-2 border-b-4 p-3 text-left transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-[#1CB0F6]/50",
        borderColor,
        bgColor,
        isDisabled
          ? "cursor-default"
          : "cursor-pointer active:border-b-2 active:translate-y-[2px]"
      )}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      initial={{ opacity: 0, y: 12 }}
      animate={
        isTryAgain
          ? { opacity: 1, y: 0, x: [0, -6, 6, -4, 4, -2, 2, 0] }
          : { opacity: 1, y: 0, x: 0 }
      }
      transition={{ duration: isTryAgain ? 0.45 : 0.2 }}
    >
      {/* Main content row */}
      <div className="flex items-center gap-3">
        {/* Illustration / Emoji */}
        {showIllustration && illustration && (
          <div
            className={cn(
              "flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-colors",
              illustrationBg
            )}
          >
            {illustration}
          </div>
        )}

        {/* Text content */}
        <div className="flex-1 min-w-0">
          {khmerText && (
            <p
              className={cn(
                "font-bold leading-tight",
                textColor,
                "text-xl"
              )}
              style={{ fontFamily: "'Noto Sans Khmer', sans-serif" }}
            >
              {khmerText}
            </p>
          )}
          {romanized && (
            <p className="text-xs text-slate-400 italic mt-0.5">{romanized}</p>
          )}
          <p
            className={cn(
              "font-semibold mt-0.5",
              khmerText ? "text-sm text-slate-500" : cn("text-base", textColor)
            )}
          >
            {text}
          </p>
        </div>

        {/* Right side: status icon or audio button */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          {isDisabled ? (
            <span className="text-xl">
              {status === "correct" ? "✓" : "✗"}
            </span>
          ) : isTryAgain ? (
            <span className="text-xl">⚠️</span>
          ) : (
            <button
              onClick={handleAudio}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                selected
                  ? "bg-[#1CB0F6]/20 text-[#1CB0F6] hover:bg-[#1CB0F6]/30"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              )}
              title="Hear pronunciation"
              tabIndex={-1}
            >
              <Volume2 className="h-4 w-4" />
            </button>
          )}

          {/* Keyboard hint badge */}
          {keyboardHint && !isDisabled && (
            <span
              className={cn(
                "text-xs font-bold w-5 h-5 rounded flex items-center justify-center",
                selected
                  ? "bg-[#1CB0F6] text-white"
                  : "bg-slate-200 text-slate-500"
              )}
            >
              {keyboardHint}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
