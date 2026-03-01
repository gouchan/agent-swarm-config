"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Volume2, Lightbulb, BookOpen, Sparkles } from "lucide-react";
import { speakKhmer } from "@/lib/audio";
import type { VocabContext } from "@/data/cultural-context";

interface LessonFooterProps {
  status: "none" | "try-again" | "correct" | "wrong" | "completed";
  onCheck: () => void;
  onNext: () => void;
  disabled: boolean;
  attemptsLeft?: number;
  hint?: string;
  correctAnswer?: string;
  correctKhmer?: string;
  correctRomanized?: string;
  correctIllustration?: string;
  vocabContext?: VocabContext | null;
  isBonus?: boolean;
  bonusExplanation?: string;
  timeLeft?: number;
}

export function LessonFooter({
  status,
  onCheck,
  onNext,
  disabled,
  attemptsLeft = 3,
  hint,
  correctAnswer,
  correctKhmer,
  correctRomanized,
  correctIllustration,
  vocabContext,
  isBonus = false,
  bonusExplanation,
  timeLeft,
}: LessonFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t-2 border-gray-200">
      <AnimatePresence mode="wait">

        {/* ── NEUTRAL: Check button ── */}
        {status === "none" && (
          <motion.div
            key="check"
            className="flex items-center justify-between bg-white px-6 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-3">
              {isBonus && (
                <span className="text-xs font-bold text-amber-500 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">
                  No penalty &mdash; just for fun!
                </span>
              )}
              {!isBonus && timeLeft !== undefined && timeLeft > 0 && (
                <span className={cn(
                  "text-sm font-extrabold tabular-nums px-2.5 py-1 rounded-lg border",
                  timeLeft <= 10
                    ? "text-red-600 bg-red-50 border-red-200 animate-pulse"
                    : "text-amber-600 bg-amber-50 border-amber-200"
                )}>
                  {timeLeft}s
                </span>
              )}
              <p className="text-sm text-slate-400 hidden md:block">
                <kbd className="bg-slate-100 border border-slate-200 text-slate-500 font-mono px-1.5 py-0.5 rounded text-xs">
                  Enter
                </kbd>{" "}
                to check
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={onCheck}
              disabled={disabled}
              className="min-w-[160px] ml-auto"
            >
              Check
            </Button>
          </motion.div>
        )}

        {/* ── TRY AGAIN: Amber encouragement panel ── */}
        {status === "try-again" && (
          <motion.div
            key="try-again"
            className="bg-amber-50 border-t-2 border-amber-200"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex flex-col md:flex-row gap-4 px-6 py-4 max-w-5xl mx-auto items-center md:items-start">
              {/* Left: Status + message */}
              <div className="flex items-center justify-between md:flex-col md:items-start md:justify-between md:w-48 flex-shrink-0 w-full">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">💪</span>
                    <span className="text-xl font-extrabold text-amber-600">
                      Not quite!
                    </span>
                  </div>
                  <p className="text-sm text-amber-700">
                    {attemptsLeft === 1
                      ? "Last chance — you can do it!"
                      : "Try a different answer."}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          i < attemptsLeft ? "bg-amber-500" : "bg-amber-200"
                        )}
                      />
                    ))}
                    <span className="text-xs text-amber-500 ml-1">
                      {attemptsLeft} {attemptsLeft === 1 ? "try" : "tries"} left
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Hint (shown when only 1 attempt left) */}
              {hint && attemptsLeft === 1 && (
                <div className="flex-1 border-t md:border-t-0 md:border-l-2 border-amber-200 pt-3 md:pt-0 md:pl-4">
                  <div className="flex gap-2 p-3 rounded-xl bg-amber-100/60 border border-amber-200">
                    <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-xs uppercase tracking-wide text-amber-600 mb-0.5">
                        Hint
                      </p>
                      <p className="text-amber-800 text-sm">{hint}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── CORRECT: Rich context panel ── */}
        {status === "correct" && (
          <motion.div
            key="correct"
            className={isBonus ? "bg-amber-50 border-t-2 border-amber-200" : "bg-green-50 border-t-2 border-green-200"}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
          >
            {/* Desktop: 2-column layout */}
            <div className="flex flex-col md:flex-row gap-4 px-6 py-4 max-w-5xl mx-auto">

              {/* Left: Status + Continue */}
              <div className="flex items-center justify-between md:flex-col md:items-start md:justify-between md:w-48 flex-shrink-0">
                <div>
                  {isBonus ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">&#x1F31F;</span>
                        <span className="text-xl font-extrabold text-amber-600">
                          Bonus: +20 XP!
                        </span>
                      </div>
                      {bonusExplanation && (
                        <p className="text-sm text-amber-700 mt-1 leading-relaxed">{bonusExplanation}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">&#x1F389;</span>
                        <span className="text-xl font-extrabold text-[#58CC02]">
                          Correct!
                        </span>
                      </div>
                      {correctIllustration && (
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl mt-1 hidden md:flex">
                          {correctIllustration}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onNext}
                  className="min-w-[130px] mt-2"
                >
                  Continue &rarr;
                </Button>
              </div>

              {/* Right: Context panel (desktop) */}
              {!isBonus && vocabContext && (
                <div className="flex-1 hidden md:block border-l-2 border-green-200 pl-4">
                  <ContextBlock
                    correctKhmer={correctKhmer}
                    correctRomanized={correctRomanized}
                    correctAnswer={correctAnswer}
                    context={vocabContext}
                    variant="correct"
                  />
                </div>
              )}

              {/* Mobile: compact context */}
              {!isBonus && vocabContext && (
                <div className="md:hidden border-t border-green-200 pt-3">
                  <ContextBlockMobile context={vocabContext} correctKhmer={correctKhmer} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── WRONG: Rich context panel ── */}
        {status === "wrong" && (
          <motion.div
            key="wrong"
            className={isBonus ? "bg-amber-50 border-t-2 border-amber-200" : "bg-rose-50 border-t-2 border-rose-200"}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex flex-col md:flex-row gap-4 px-6 py-4 max-w-5xl mx-auto">

              {/* Left: Status + Got it */}
              <div className="flex items-center justify-between md:flex-col md:items-start md:justify-between md:w-48 flex-shrink-0">
                <div>
                  {isBonus ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">&#x1F4A1;</span>
                        <span className="text-xl font-extrabold text-amber-600">
                          Not this time!
                        </span>
                      </div>
                      {correctAnswer && (
                        <div className="mt-1">
                          <p className="text-xs text-amber-500 font-medium">The answer was:</p>
                          <p className="font-bold text-amber-700 text-sm">{correctAnswer}</p>
                        </div>
                      )}
                      {bonusExplanation && (
                        <p className="text-xs text-amber-600 mt-1.5 leading-relaxed">{bonusExplanation}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">&#x274C;</span>
                        <span className="text-xl font-extrabold text-[#E53838]">
                          Wrong
                        </span>
                      </div>
                      {correctAnswer && (
                        <div className="mt-1">
                          <p className="text-xs text-rose-400 font-medium">Correct answer:</p>
                          <p className="font-bold text-rose-700 text-sm">
                            {correctKhmer && (
                              <span
                                className="mr-1"
                                style={{ fontFamily: "'Noto Sans Khmer', sans-serif" }}
                              >
                                {correctKhmer}{" "}
                              </span>
                            )}
                            {correctAnswer}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <Button
                  variant={isBonus ? "secondary" : "danger"}
                  size="lg"
                  onClick={onNext}
                  className="min-w-[130px] mt-2"
                >
                  Got it
                </Button>
              </div>

              {/* Right: Context panel — not shown for bonus */}
              {!isBonus && vocabContext && (
                <div className="flex-1 hidden md:block border-l-2 border-rose-200 pl-4">
                  <ContextBlock
                    correctKhmer={correctKhmer}
                    correctRomanized={correctRomanized}
                    correctAnswer={correctAnswer}
                    context={vocabContext}
                    variant="wrong"
                  />
                </div>
              )}

              {/* Mobile — not shown for bonus */}
              {!isBonus && vocabContext && (
                <div className="md:hidden border-t border-rose-200 pt-3">
                  <ContextBlockMobile context={vocabContext} correctKhmer={correctKhmer} />
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// ─── Full context block (desktop) ──────────────────────────────────────────

interface ContextBlockProps {
  correctKhmer?: string;
  correctRomanized?: string;
  correctAnswer?: string;
  context: VocabContext;
  variant: "correct" | "wrong";
}

function ContextBlock({
  correctKhmer,
  correctRomanized,
  correctAnswer,
  context,
  variant,
}: ContextBlockProps) {
  const accent = variant === "correct" ? "text-green-700" : "text-rose-700";
  const sectionBg =
    variant === "correct"
      ? "bg-green-100/60 border-green-200"
      : "bg-rose-100/60 border-rose-200";

  return (
    <div className="space-y-2 text-sm">
      {/* Word header with audio */}
      {correctKhmer && (
        <div className="flex items-center gap-3 mb-3">
          <div>
            <button
              onClick={() => speakKhmer(correctKhmer)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors",
                variant === "correct"
                  ? "border-green-300 bg-green-100 hover:bg-green-200 text-green-700"
                  : "border-rose-300 bg-rose-100 hover:bg-rose-200 text-rose-700"
              )}
            >
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "'Noto Sans Khmer', sans-serif" }}
              >
                {correctKhmer}
              </span>
              <Volume2 className="h-4 w-4 flex-shrink-0" />
            </button>
            {correctRomanized && (
              <p className="text-xs text-slate-400 italic mt-0.5 ml-1">
                /{correctRomanized}/
              </p>
            )}
          </div>
          {correctAnswer && (
            <span className={cn("font-semibold text-base", accent)}>
              = {correctAnswer}
            </span>
          )}
        </div>
      )}

      {/* Character breakdown */}
      {context.charBreakdown && (
        <div className={cn("flex gap-2 p-2 rounded-lg border", sectionBg)}>
          <BookOpen className={cn("h-4 w-4 mt-0.5 flex-shrink-0", accent)} />
          <div>
            <p className="font-semibold text-xs uppercase tracking-wide text-slate-500 mb-0.5">
              Script breakdown
            </p>
            <p className="text-slate-700 leading-relaxed">
              {context.charBreakdown}
            </p>
          </div>
        </div>
      )}

      {/* Cultural note */}
      <div className={cn("flex gap-2 p-2 rounded-lg border", sectionBg)}>
        <span className="text-base flex-shrink-0">🇰🇭</span>
        <div>
          <p className="font-semibold text-xs uppercase tracking-wide text-slate-500 mb-0.5">
            Cultural context
          </p>
          <p className="text-slate-700 leading-relaxed">{context.culturalNote}</p>
        </div>
      </div>

      {/* Mnemonic */}
      <div className={cn("flex gap-2 p-2 rounded-lg border", sectionBg)}>
        <Lightbulb className={cn("h-4 w-4 mt-0.5 flex-shrink-0", accent)} />
        <div>
          <p className="font-semibold text-xs uppercase tracking-wide text-slate-500 mb-0.5">
            Memory trick
          </p>
          <p className="text-slate-700 leading-relaxed italic">
            {context.mnemonic}
          </p>
        </div>
      </div>

      {/* Fun fact */}
      {context.funFact && (
        <div className={cn("flex gap-2 p-2 rounded-lg border", sectionBg)}>
          <Sparkles className={cn("h-4 w-4 mt-0.5 flex-shrink-0", accent)} />
          <div>
            <p className="font-semibold text-xs uppercase tracking-wide text-slate-500 mb-0.5">
              Fun fact
            </p>
            <p className="text-slate-700 leading-relaxed">{context.funFact}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Compact mobile context ─────────────────────────────────────────────────

function ContextBlockMobile({
  context,
  correctKhmer,
}: {
  context: VocabContext;
  correctKhmer?: string;
}) {
  return (
    <div className="space-y-1.5 text-xs">
      {correctKhmer && (
        <button
          onClick={() => speakKhmer(correctKhmer)}
          className="flex items-center gap-1.5 text-slate-600"
        >
          <Volume2 className="h-3.5 w-3.5" />
          <span style={{ fontFamily: "'Noto Sans Khmer', sans-serif" }}>
            {correctKhmer}
          </span>
        </button>
      )}
      <p className="text-slate-600">
        <span className="font-bold">🧠 </span>
        {context.mnemonic}
      </p>
    </div>
  );
}
