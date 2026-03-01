"use client";

import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChallengeCard } from "./challenge-card";
import { speakKhmer, speakText } from "@/lib/audio";
import type { Challenge as ChallengeType } from "@/data/types";

interface ChallengeProps {
  challenge: ChallengeType;
  selectedOptionId: string | null;
  status: "none" | "correct" | "wrong";
  onSelect: (id: string) => void;
  /** Vocab emoji illustrations indexed by option id */
  optionIllustrations?: Record<string, string>;
  /** Romanizations for option texts */
  optionRomanized?: Record<string, string>;
}

export function Challenge({
  challenge,
  selectedOptionId,
  status,
  onSelect,
  optionIllustrations,
  optionRomanized,
}: ChallengeProps) {
  const isAssistType = challenge.type === "ASSIST";
  const isSelectType = challenge.type === "SELECT";

  // For SELECT type show 2-col grid with big illustrations
  // For ASSIST type show 1-col list
  const gridClass = isAssistType
    ? "flex flex-col gap-3 max-w-lg"
    : "grid grid-cols-2 gap-3 max-w-xl";

  function handleQuestionAudio() {
    if (challenge.questionKhmer) {
      speakKhmer(challenge.questionKhmer);
    } else {
      speakText(challenge.questionText);
    }
  }

  return (
    <div className="flex flex-col items-center px-4 py-6 max-w-2xl mx-auto w-full">
      {/* Question block */}
      <motion.div
        className="mb-6 text-center w-full"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Instruction label */}
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">
          {isSelectType
            ? "What does this mean?"
            : isAssistType
            ? "Select the correct Khmer"
            : "Complete the sentence"}
        </p>

        {/* Main question — Khmer word or English phrase */}
        <div className="inline-flex items-center gap-3 bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-4">
          {challenge.questionKhmer ? (
            <>
              <span
                className="text-4xl font-bold text-slate-800 leading-tight"
                style={{ fontFamily: "'Noto Sans Khmer', sans-serif" }}
              >
                {challenge.questionKhmer}
              </span>
              {/* Audio for question word */}
              <button
                onClick={handleQuestionAudio}
                className="p-2 rounded-xl bg-[#1CB0F6]/10 text-[#1CB0F6] hover:bg-[#1CB0F6]/20 transition-colors flex-shrink-0"
                title="Hear pronunciation"
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </>
          ) : (
            <span className="text-2xl font-bold text-slate-800">
              {challenge.questionText}
            </span>
          )}
        </div>

        {/* Secondary question text */}
        {challenge.questionKhmer && (
          <p className="mt-3 text-lg font-semibold text-slate-600">
            {challenge.questionText}
          </p>
        )}

        {challenge.hint && (
          <p className="mt-2 text-sm text-slate-400 italic">
            💡 {challenge.hint}
          </p>
        )}

        {/* Keyboard hint */}
        <p className="mt-2 text-xs text-slate-300 hidden md:block">
          Press <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono text-xs border border-slate-200">1</kbd>–
          <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono text-xs border border-slate-200">4</kbd> to select &nbsp;·&nbsp;
          <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono text-xs border border-slate-200">Enter</kbd> to check
        </p>
      </motion.div>

      {/* Options */}
      <div className={cn("w-full", gridClass)}>
        {challenge.options.map((option, index) => {
          const optionStatus: "none" | "correct" | "wrong" =
            status === "none"
              ? "none"
              : option.id === selectedOptionId
              ? option.isCorrect
                ? "correct"
                : "wrong"
              // Also highlight the correct answer in red when user got it wrong
              : option.isCorrect && status === "wrong"
              ? "correct"
              : "none";

          // For SELECT type the option.text is the English translation
          // For ASSIST type the option.text is the Khmer word
          const isKhmerOption = isAssistType;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.22 }}
            >
              <ChallengeCard
                text={isKhmerOption ? "" : option.text}
                khmerText={isKhmerOption ? option.text : undefined}
                romanized={optionRomanized?.[option.id]}
                illustration={optionIllustrations?.[option.id]}
                selected={option.id === selectedOptionId}
                status={optionStatus}
                onClick={() => onSelect(option.id)}
                keyboardHint={String(index + 1)}
                showIllustration={true}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
