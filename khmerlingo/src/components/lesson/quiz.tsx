"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game-store";
import { LessonHeader } from "./lesson-header";
import { Challenge } from "./challenge";
import { LessonFooter } from "./lesson-footer";
import { ResultScreen } from "./result-screen";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { playCorrectSound, playWrongSound, preloadAudio } from "@/lib/audio";
import { culturalContext } from "@/data/cultural-context";
import type { Module } from "@/data/types";

interface QuizProps {
  module: Module;
}

const XP_PER_CORRECT = 10;

export function Quiz({ module }: QuizProps) {
  const router = useRouter();
  const { hearts, loseHeart, addXP, completeModule, updateStreak } =
    useGameStore();

  const challenges = module.challenges;
  const totalChallenges = challenges.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"none" | "correct" | "wrong">("none");
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const currentChallenge = challenges[currentIndex];
  const progress =
    totalChallenges > 0
      ? Math.round((currentIndex / totalChallenges) * 100)
      : 0;

  // ── Derive vocab item for current challenge ───────────────────────────────
  const currentVocabItem = currentChallenge
    ? module.vocabulary.find((v) => v.id === currentChallenge.vocabId) ?? null
    : null;

  // ── Cultural context lookup ───────────────────────────────────────────────
  const vocabContext = currentChallenge
    ? (culturalContext[currentChallenge.vocabId] ?? null)
    : null;

  // ── Build option illustrations for ASSIST/SELECT challenges ──────────────
  // For ASSIST: options have Khmer text → match to vocab by khmer field
  // For SELECT: options have English text → match to vocab by english field
  const optionIllustrations: Record<string, string> = {};
  const optionRomanized: Record<string, string> = {};
  if (currentChallenge) {
    const isAssist = currentChallenge.type === "ASSIST";
    currentChallenge.options.forEach((opt) => {
      const vocabMatch = isAssist
        ? module.vocabulary.find((v) => v.khmer === opt.text)
        : module.vocabulary.find((v) => v.english === opt.text);
      if (vocabMatch?.imageEmoji) {
        optionIllustrations[opt.id] = vocabMatch.imageEmoji;
      }
      if (vocabMatch?.romanized && isAssist) {
        optionRomanized[opt.id] = vocabMatch.romanized;
      }
    });
  }

  // ── Preload audio for vocabulary in this module ───────────────────────────
  useEffect(() => {
    const englishTexts = module.vocabulary.map((v) => v.english);
    preloadAudio(englishTexts);
  }, [module.vocabulary]);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (status !== "none") return;
      setSelectedOptionId(optionId);
    },
    [status]
  );

  const handleCheck = useCallback(() => {
    if (!selectedOptionId || !currentChallenge) return;

    const selectedOption = currentChallenge.options.find(
      (o) => o.id === selectedOptionId
    );
    if (!selectedOption) return;

    if (selectedOption.isCorrect) {
      setStatus("correct");
      setCorrectCount((prev) => prev + 1);
      addXP(XP_PER_CORRECT);
      setXpEarned((prev) => prev + XP_PER_CORRECT);
      playCorrectSound();
    } else {
      setStatus("wrong");
      loseHeart();
      playWrongSound();
    }
  }, [selectedOptionId, currentChallenge, addXP, loseHeart]);

  const handleNext = useCallback(() => {
    if (currentIndex >= totalChallenges - 1) {
      // Lesson complete
      setCompleted(true);
      completeModule(module.id);
      updateStreak();
      return;
    }

    // Advance to next challenge
    setCurrentIndex((prev) => prev + 1);
    setSelectedOptionId(null);
    setStatus("none");
  }, [currentIndex, totalChallenges, completeModule, module.id, updateStreak]);

  // Index-based select for keyboard shortcuts (1-4 keys)
  const handleSelectByIndex = useCallback(
    (index: number) => {
      if (!currentChallenge || status !== "none") return;
      const option = currentChallenge.options[index];
      if (option) setSelectedOptionId(option.id);
    },
    [currentChallenge, status]
  );

  // Wire keyboard shortcuts — must come after handleCheck/handleNext are defined
  useKeyboardShortcuts({
    numOptions: currentChallenge?.options.length ?? 0,
    onSelect: handleSelectByIndex,
    onCheck: handleCheck,
    onNext: handleNext,
    status,
    disabled: !selectedOptionId,
  });

  const handleClose = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleContinueHome = useCallback(() => {
    router.push("/");
  }, [router]);

  // No hearts left
  if (hearts <= 0 && !completed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-6xl">💔</span>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-800">
            No hearts left!
          </h2>
          <p className="mt-2 text-gray-500">
            Practice again later or refill your hearts.
          </p>
          <button
            onClick={handleClose}
            className="mt-6 rounded-xl border-b-4 border-b-[#1899D6] bg-[#1CB0F6] px-8 py-3 font-bold text-white transition-all active:translate-y-[2px] active:border-b-2"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  // Lesson complete
  if (completed) {
    return (
      <ResultScreen
        xpEarned={xpEarned}
        heartsLeft={hearts}
        totalChallenges={totalChallenges}
        correctCount={correctCount}
        onContinue={handleContinueHome}
        moduleVocabIds={module.vocabulary.map((v) => v.id)}
      />
    );
  }

  // Correct answer enrichment for footer
  const correctOption = currentChallenge?.options.find((o) => o.isCorrect);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <LessonHeader
        progress={progress}
        hearts={hearts}
        onClose={handleClose}
      />

      {/* Challenge */}
      <div className="flex flex-1 items-center justify-center pb-24">
        <AnimatePresence mode="wait">
          {currentChallenge && (
            <motion.div
              key={currentChallenge.id}
              className="w-full"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Challenge
                challenge={currentChallenge}
                selectedOptionId={selectedOptionId}
                status={status}
                onSelect={handleSelect}
                optionIllustrations={optionIllustrations}
                optionRomanized={optionRomanized}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <LessonFooter
        status={status}
        onCheck={handleCheck}
        onNext={handleNext}
        disabled={!selectedOptionId}
        correctAnswer={currentVocabItem?.english ?? correctOption?.text}
        correctKhmer={currentVocabItem?.khmer}
        correctRomanized={currentVocabItem?.romanized}
        correctIllustration={currentVocabItem?.imageEmoji}
        vocabContext={vocabContext}
      />
    </div>
  );
}
