"use client";

import { motion } from "framer-motion";
import { Volume2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChallengeCard } from "./challenge-card";
import { speakKhmer, speakText } from "@/lib/audio";
import type { Challenge as ChallengeType } from "@/data/types";

interface ChallengeProps {
  challenge: ChallengeType;
  selectedOptionId: string | null;
  status: "none" | "correct" | "wrong" | "try-again";
  onSelect: (id: string) => void;
  /** Vocab emoji illustrations indexed by option id */
  optionIllustrations?: Record<string, string>;
  /** Romanizations for option texts */
  optionRomanized?: Record<string, string>;
  // For MATCH type only
  matchLeftItems?: Array<{id: string; optionId: string; text: string}>;
  matchRightItems?: Array<{id: string; optionId: string; text: string}>;
  matchSelectedLeft?: string | null;
  matchPairs?: Record<string, string>; // leftItemId -> rightItemId
  matchCorrectPairs?: Record<string, string>; // leftItemId -> rightItemId (confirmed correct on try-again)
  onMatchSelectLeft?: (id: string) => void;
  onMatchSelectRight?: (leftId: string, rightId: string) => void;
  // For CONVERSATIONAL type only
  conversationalInput?: string;
  onConversationalInputChange?: (value: string) => void;
  gradeFeedback?: string;
  gradeScore?: number;
}

export function Challenge({
  challenge,
  selectedOptionId,
  status,
  onSelect,
  optionIllustrations,
  optionRomanized,
  matchLeftItems = [],
  matchRightItems = [],
  matchSelectedLeft = null,
  matchPairs = {},
  matchCorrectPairs = {},
  onMatchSelectLeft,
  onMatchSelectRight,
  conversationalInput = "",
  onConversationalInputChange,
  gradeFeedback,
  gradeScore,
}: ChallengeProps) {
  const isAssistType = challenge.type === "ASSIST";
  const isSelectType = challenge.type === "SELECT";
  const isFillBlank = challenge.type === "FILL_BLANK";
  const isMatch = challenge.type === "MATCH";
  const isConversational = challenge.type === "CONVERSATIONAL";

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

  // Instruction label
  let instructionLabel = "Complete the sentence";
  if (isSelectType) instructionLabel = "What does this mean?";
  else if (isAssistType) instructionLabel = "Select the correct Khmer";
  else if (isFillBlank) instructionLabel = "Complete the sentence";
  else if (isMatch) instructionLabel = "Match the pairs";
  else if (isConversational) instructionLabel = "Type your answer in Khmer";

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
          {instructionLabel}
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

        {/* Keyboard hint — not shown for MATCH */}
        {!isMatch && (
          <p className="mt-2 text-xs text-slate-300 hidden md:block">
            Press <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono text-xs border border-slate-200">1</kbd>–
            <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono text-xs border border-slate-200">4</kbd> to select &nbsp;·&nbsp;
            <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono text-xs border border-slate-200">Enter</kbd> to check
          </p>
        )}
        {isMatch && (
          <p className="mt-2 text-xs text-slate-300 hidden md:block">
            Select a Khmer word, then select the matching English meaning
          </p>
        )}
      </motion.div>

      {/* ── FILL_BLANK options ── */}
      {isFillBlank && (
        <div className="flex flex-wrap gap-2 justify-center max-w-lg w-full">
          {challenge.options.map((option, index) => {
            const optionStatus: "none" | "correct" | "wrong" | "try-again" =
              status === "correct" || status === "wrong"
                ? option.id === selectedOptionId
                  ? option.isCorrect
                    ? "correct"
                    : "wrong"
                  : option.isCorrect && status === "wrong"
                  ? "correct"
                  : "none"
                : status === "try-again" && option.id === selectedOptionId
                ? "try-again"
                : "none";

            const isSelected = option.id === selectedOptionId;

            const pillColorClass =
              optionStatus === "correct"
                ? "border-[#58CC02] bg-[#58CC02]/10 text-[#3a8a00]"
                : optionStatus === "wrong"
                ? "border-[#E53838] bg-[#E53838]/10 text-[#E53838]"
                : optionStatus === "try-again"
                ? "border-amber-400 bg-amber-50 text-amber-700"
                : isSelected
                ? "border-[#1CB0F6] bg-[#1CB0F6]/10 text-[#1CB0F6]"
                : "border-slate-300 bg-white text-slate-700 hover:border-[#1CB0F6] hover:bg-[#1CB0F6]/5";

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.22 }}
                onClick={() => onSelect(option.id)}
                className={cn(
                  "border-2 rounded-xl px-4 py-2 font-bold text-base transition-colors flex items-center gap-2",
                  pillColorClass
                )}
                style={{ fontFamily: "'Noto Sans Khmer', sans-serif" }}
                title={`Option ${index + 1}`}
              >
                <span className="text-xs font-mono text-current opacity-50 mr-1">{index + 1}</span>
                {option.text}
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    speakKhmer(option.text);
                  }}
                  className="p-0.5 rounded-md hover:bg-black/5 transition-colors flex-shrink-0 cursor-pointer"
                  title="Hear pronunciation"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ── MATCH options ── */}
      {isMatch && (
        <div className="flex gap-4 w-full max-w-lg">
          {/* Left column: Khmer items */}
          <div className="flex flex-col gap-2 flex-1">
            {matchLeftItems.map((item, index) => {
              const isPaired = item.id in matchPairs;
              const isCorrectPaired = item.id in matchCorrectPairs;
              const isActiveSelected = matchSelectedLeft === item.id;

              let itemColorClass = "border-gray-200 bg-white hover:border-[#1CB0F6] hover:bg-[#1CB0F6]/5";
              if (status === "correct") {
                itemColorClass = "border-green-400 bg-green-50 text-green-700";
              } else if (status === "wrong") {
                if (isCorrectPaired) {
                  itemColorClass = "border-green-400 bg-green-50 text-green-700";
                } else if (isPaired) {
                  itemColorClass = "border-red-400 bg-red-50 text-red-700";
                }
              } else if (isCorrectPaired) {
                itemColorClass = "border-green-400 bg-green-50 text-green-700";
              } else if (isActiveSelected) {
                itemColorClass = "border-blue-400 bg-blue-50 text-blue-700";
              } else if (isPaired) {
                itemColorClass = "border-amber-300 bg-amber-50 text-amber-700";
              }

              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.22 }}
                  onClick={() => onMatchSelectLeft?.(item.id)}
                  className={cn(
                    "py-3 px-3 rounded-xl border-2 text-sm font-bold w-full text-center transition-colors flex items-center justify-center gap-1.5",
                    itemColorClass
                  )}
                  style={{ fontFamily: "'Noto Sans Khmer', sans-serif" }}
                >
                  {item.text}
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      speakKhmer(item.text);
                    }}
                    className="p-0.5 rounded-md hover:bg-black/5 transition-colors flex-shrink-0 cursor-pointer"
                    title="Hear pronunciation"
                  >
                    <Volume2 className="h-3 w-3 opacity-60" />
                  </span>
                  {status === "correct" && <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />}
                  {status === "wrong" && isPaired && !isCorrectPaired && <X className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />}
                  {status === "wrong" && isCorrectPaired && <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />}
                </motion.button>
              );
            })}
          </div>

          {/* Right column: English meanings */}
          <div className="flex flex-col gap-2 flex-1">
            {matchRightItems.map((item, index) => {
              // Find if this right item is paired to any left item
              const pairedLeftId = Object.entries(matchPairs).find(([, rId]) => rId === item.id)?.[0];
              const isPaired = pairedLeftId !== undefined;
              const isCorrectPaired = pairedLeftId !== undefined && pairedLeftId in matchCorrectPairs && matchCorrectPairs[pairedLeftId] === item.id;

              let itemColorClass = "border-gray-200 bg-white hover:border-[#1CB0F6] hover:bg-[#1CB0F6]/5";
              if (status === "correct") {
                itemColorClass = "border-green-400 bg-green-50 text-green-700";
              } else if (status === "wrong") {
                if (isCorrectPaired) {
                  itemColorClass = "border-green-400 bg-green-50 text-green-700";
                } else if (isPaired) {
                  itemColorClass = "border-red-400 bg-red-50 text-red-700";
                }
              } else if (isCorrectPaired) {
                itemColorClass = "border-green-400 bg-green-50 text-green-700";
              } else if (isPaired) {
                itemColorClass = "border-amber-300 bg-amber-50 text-amber-700";
              } else if (matchSelectedLeft !== null) {
                // highlight potential target when a left item is selected
                itemColorClass = "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer";
              }

              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.22 }}
                  onClick={() => {
                    if (matchSelectedLeft !== null) {
                      onMatchSelectRight?.(matchSelectedLeft, item.id);
                    }
                  }}
                  className={cn(
                    "py-3 px-3 rounded-xl border-2 text-sm font-bold w-full text-center transition-colors flex items-center justify-center gap-1.5",
                    itemColorClass
                  )}
                >
                  {item.text}
                  {status === "correct" && <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />}
                  {status === "wrong" && isPaired && !isCorrectPaired && <X className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />}
                  {status === "wrong" && isCorrectPaired && <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SELECT / ASSIST options ── */}
      {(isSelectType || isAssistType) && (
        <div className={cn("w-full", gridClass)}>
          {challenge.options.map((option, index) => {
            const optionStatus: "none" | "correct" | "wrong" | "try-again" =
              status === "correct" || status === "wrong"
                ? option.id === selectedOptionId
                  ? option.isCorrect
                    ? "correct"
                    : "wrong"
                  // Reveal correct answer when user exhausted attempts
                  : option.isCorrect && status === "wrong"
                  ? "correct"
                  : "none"
                // try-again: mark the previously-wrong selected card as try-again
                : status === "try-again" && option.id === selectedOptionId
                ? "try-again"
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
      )}

      {/* ── CONVERSATIONAL (type your answer) ── */}
      {isConversational && (
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="relative">
            <textarea
              value={conversationalInput}
              onChange={(e) => onConversationalInputChange?.(e.target.value)}
              placeholder="Type your answer in Khmer..."
              maxLength={200}
              disabled={status === "correct" || status === "wrong"}
              className={cn(
                "w-full min-h-[100px] resize-none rounded-2xl border-2 px-4 py-3 text-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1CB0F6]/40",
                status === "correct"
                  ? "border-[#58CC02] bg-green-50 text-green-800"
                  : status === "wrong"
                  ? "border-[#E53838] bg-rose-50 text-rose-800"
                  : status === "try-again"
                  ? "border-amber-400 bg-amber-50 text-amber-800"
                  : "border-slate-300 bg-white text-slate-800 hover:border-[#1CB0F6]"
              )}
              style={{ fontFamily: "'Noto Sans Khmer', sans-serif" }}
              autoFocus
            />
            {/* Character count */}
            <span className="absolute bottom-2 right-3 text-xs text-slate-300 tabular-nums">
              {conversationalInput.length}/200
            </span>
          </div>

          {/* Grade feedback */}
          {gradeFeedback && (
            <motion.div
              className={cn(
                "mt-3 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2",
                status === "correct"
                  ? "bg-green-100 text-green-800"
                  : status === "try-again"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800"
              )}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span>
                {status === "correct" ? "\u2705" : status === "try-again" ? "\uD83D\uDCA1" : "\u274C"}
              </span>
              <span>{gradeFeedback}</span>
              {gradeScore !== undefined && (
                <span className="ml-auto text-xs opacity-70">
                  {gradeScore}% match
                </span>
              )}
            </motion.div>
          )}

          {/* Hint for Khmer input */}
          <p className="mt-2 text-xs text-slate-400 text-center">
            Use your Khmer keyboard or romanized input. Press{" "}
            <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono text-xs border border-slate-200">
              Enter
            </kbd>{" "}
            to check.
          </p>
        </motion.div>
      )}
    </div>
  );
}
