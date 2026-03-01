"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Volume2, Lightbulb, BookOpen, Sparkles } from "lucide-react";
import { speakKhmer } from "@/lib/audio";
import type { VocabContext } from "@/data/cultural-context";

interface LessonFooterProps {
  status: "none" | "correct" | "wrong" | "completed";
  onCheck: () => void;
  onNext: () => void;
  disabled: boolean;
  correctAnswer?: string;
  correctKhmer?: string;
  correctRomanized?: string;
  correctIllustration?: string;
  vocabContext?: VocabContext | null;
}

export function LessonFooter({
  status,
  onCheck,
  onNext,
  disabled,
  correctAnswer,
  correctKhmer,
  correctRomanized,
  correctIllustration,
  vocabContext,
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
            <p className="text-sm text-slate-400 hidden md:block">
              <kbd className="bg-slate-100 border border-slate-200 text-slate-500 font-mono px-1.5 py-0.5 rounded text-xs">
                Enter
              </kbd>{" "}
              to check
            </p>
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

        {/* ── CORRECT: Rich context panel ── */}
        {status === "correct" && (
          <motion.div
            key="correct"
            className="bg-green-50 border-t-2 border-green-200"
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
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🎉</span>
                    <span className="text-xl font-extrabold text-[#58CC02]">
                      Correct!
                    </span>
                  </div>
                  {correctIllustration && (
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl mt-1 hidden md:flex">
                      {correctIllustration}
                    </div>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onNext}
                  className="min-w-[130px] mt-2"
                >
                  Continue →
                </Button>
              </div>

              {/* Right: Context panel (desktop) */}
              {vocabContext && (
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
              {vocabContext && (
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
            className="bg-rose-50 border-t-2 border-rose-200"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex flex-col md:flex-row gap-4 px-6 py-4 max-w-5xl mx-auto">

              {/* Left: Status + Got it */}
              <div className="flex items-center justify-between md:flex-col md:items-start md:justify-between md:w-48 flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">❌</span>
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
                </div>
                <Button
                  variant="danger"
                  size="lg"
                  onClick={onNext}
                  className="min-w-[130px] mt-2"
                >
                  Got it
                </Button>
              </div>

              {/* Right: Context panel */}
              {vocabContext && (
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

              {/* Mobile */}
              {vocabContext && (
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
