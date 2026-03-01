"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game-store";
import { LessonHeader } from "./lesson-header";
import { Challenge } from "./challenge";
import { LessonFooter } from "./lesson-footer";
import { ResultScreen } from "./result-screen";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { playCorrectSound, playWrongSound, preloadAudio } from "@/lib/audio";
import { culturalContext, bonusQuestions } from "@/data/cultural-context";
import type { Module } from "@/data/types";

type LessonMode = "normal" | "legendary";

interface QuizProps {
  module: Module;
  mode: LessonMode;
}

function getTimerDuration(type: string): number {
  switch (type) {
    case "MATCH":
      return 60;
    case "FILL_BLANK":
      return 45;
    case "CONVERSATIONAL":
      return 90;
    default:
      return 30; // SELECT, ASSIST
  }
}

export function Quiz({ module, mode }: QuizProps) {
  const router = useRouter();
  const { hearts, loseHeart, addXP, completeModule, completeLegendaryModule, updateStreak } =
    useGameStore();

  const XP_PER_CORRECT = mode === "legendary" ? 20 : 10;

  const challenges = module.challenges;
  const totalChallenges = challenges.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"none" | "try-again" | "correct" | "wrong">("none");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  // MATCH challenge state
  const [matchLeftItems, setMatchLeftItems] = useState<Array<{ id: string; optionId: string; text: string }>>([]);
  const [matchRightItems, setMatchRightItems] = useState<Array<{ id: string; optionId: string; text: string }>>([]);
  const [matchSelectedLeft, setMatchSelectedLeft] = useState<string | null>(null);
  const [matchPairs, setMatchPairs] = useState<Record<string, string>>({});
  const [matchCorrectPairs, setMatchCorrectPairs] = useState<Record<string, string>>({});

  // Timer state (legendary mode)
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusRef = useRef(status);
  statusRef.current = status;

  // Conversational challenge state
  const [conversationalInput, setConversationalInput] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [gradeScore, setGradeScore] = useState<number | undefined>(undefined);
  const [isGrading, setIsGrading] = useState(false);

  // Bonus round state
  const [showBonusRound, setShowBonusRound] = useState(false);
  const [bonusChallenge, setBonusChallenge] = useState<{
    question: string;
    answer: string;
    options: { id: string; text: string; isCorrect: boolean }[];
    explanation: string;
  } | null>(null);

  const currentChallenge = !showBonusRound ? challenges[currentIndex] : undefined;
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

  // ── Reset MATCH state when challenge changes ──────────────────────────────
  useEffect(() => {
    if (currentChallenge?.type === "MATCH") {
      const pairs = currentChallenge.options.map((o) => {
        const parts = o.text.split(" → ");
        return { id: o.id, left: (parts[0] ?? o.text).trim(), right: (parts[1] ?? "").trim() };
      });
      const leftShuffled = [...pairs.map((p) => ({ id: p.id + "-L", optionId: p.id, text: p.left }))]
        .sort(() => Math.random() - 0.5);
      const rightShuffled = [...pairs.map((p) => ({ id: p.id + "-R", optionId: p.id, text: p.right }))]
        .sort(() => Math.random() - 0.5);
      setMatchLeftItems(leftShuffled);
      setMatchRightItems(rightShuffled);
      setMatchSelectedLeft(null);
      setMatchPairs({});
      setMatchCorrectPairs({});
    }
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Timer logic (legendary mode) ──────────────────────────────────────────
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mode !== "legendary" || showBonusRound) {
      setTimeLeft(0);
      return;
    }

    if (!currentChallenge) return;

    // Only start if status is 'none'
    if (statusRef.current !== "none") return;

    const duration = getTimerDuration(currentChallenge.type);
    setTimeLeft(duration);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          // Timeout — auto-fail
          setStatus("wrong");
          loseHeart();
          playWrongSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIndex, mode, showBonusRound]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear timer when status changes away from 'none'
  useEffect(() => {
    if (status !== "none" && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [status]);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (status === "correct" || status === "wrong") return;
      // Re-selection during try-again resets back to none so Check button appears
      if (status === "try-again") {
        setStatus("none");
      }
      setSelectedOptionId(optionId);
    },
    [status]
  );

  const handleMatchSelectLeft = useCallback(
    (id: string) => {
      if (status === "correct" || status === "wrong") return;
      setMatchSelectedLeft((prev) => (prev === id ? null : id));
    },
    [status]
  );

  const handleMatchSelectRight = useCallback(
    (leftId: string, rightId: string) => {
      if (status === "correct" || status === "wrong") return;
      setMatchPairs((prev) => ({ ...prev, [leftId]: rightId }));
      setMatchSelectedLeft(null);
    },
    [status]
  );

  const handleCheck = useCallback(async () => {
    if (status !== "none") return;

    // ── Bonus round check ──
    if (showBonusRound && bonusChallenge) {
      const selected = bonusChallenge.options.find((o) => o.id === selectedOptionId);
      if (!selected) return;
      if (selected.isCorrect) {
        addXP(20); // bonus XP
        setXpEarned((prev) => prev + 20);
        setStatus("correct");
        playCorrectSound();
      } else {
        setStatus("wrong");
        playWrongSound();
        // No heart loss for bonus round!
      }
      return;
    }

    if (!currentChallenge) return;

    // ── CONVERSATIONAL challenge: grade via API ──
    if (currentChallenge.type === "CONVERSATIONAL") {
      if (!conversationalInput.trim()) return;
      setIsGrading(true);
      try {
        // Gather accepted answers from options
        const acceptedAnswers = currentChallenge.options
          .filter((o) => o.isCorrect)
          .map((o) => o.text);
        const res = await fetch("/api/grade-challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userAnswer: conversationalInput,
            correctAnswer: currentChallenge.correctAnswer,
            acceptedAnswers,
          }),
        });
        const data = await res.json();
        setGradeScore(data.score);

        if (data.correct) {
          setGradeFeedback(data.feedback);
          setStatus("correct");
          setCorrectCount((prev) => prev + 1);
          addXP(XP_PER_CORRECT);
          setXpEarned((prev) => prev + XP_PER_CORRECT);
          playCorrectSound();
        } else if (attemptsLeft > 1) {
          setGradeFeedback(data.feedback + (data.suggestion ? ` Hint: ${data.suggestion}` : ""));
          setStatus("try-again");
          setAttemptsLeft((prev) => prev - 1);
          playWrongSound();
        } else {
          setGradeFeedback(data.feedback);
          setStatus("wrong");
          loseHeart();
          playWrongSound();
        }
      } catch {
        setGradeFeedback("Grading error — try again.");
      } finally {
        setIsGrading(false);
      }
      return;
    }

    // MATCH challenge: validate all pairs
    if (currentChallenge?.type === "MATCH") {
      if (Object.keys(matchPairs).length < matchLeftItems.length) return; // not all paired
      const allCorrect = Object.entries(matchPairs).every(([leftId, rightId]) => {
        const left = matchLeftItems.find((i) => i.id === leftId);
        const right = matchRightItems.find((i) => i.id === rightId);
        return left && right && left.optionId === right.optionId;
      });
      if (allCorrect) {
        setStatus("correct");
        setCorrectCount((prev) => prev + 1);
        addXP(XP_PER_CORRECT);
        setXpEarned((prev) => prev + XP_PER_CORRECT);
        setMatchCorrectPairs({ ...matchPairs });
        playCorrectSound();
      } else if (attemptsLeft > 1) {
        // Keep correct pairs, remove wrong ones
        const correctOnes: Record<string, string> = {};
        for (const [leftId, rightId] of Object.entries(matchPairs)) {
          const left = matchLeftItems.find((i) => i.id === leftId);
          const right = matchRightItems.find((i) => i.id === rightId);
          if (left && right && left.optionId === right.optionId) {
            correctOnes[leftId] = rightId;
          }
        }
        setMatchCorrectPairs(correctOnes);
        setMatchPairs(correctOnes); // reset to only correct pairs
        setMatchSelectedLeft(null);
        setStatus("try-again");
        setAttemptsLeft((prev) => prev - 1);
        playWrongSound();
      } else {
        setStatus("wrong");
        loseHeart();
        playWrongSound();
      }
      return;
    }

    if (!selectedOptionId) return;

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
    } else if (attemptsLeft > 1) {
      // Still have attempts — show try-again
      setStatus("try-again");
      setAttemptsLeft((prev) => prev - 1);
      playWrongSound();
    } else {
      // No attempts left — wrong, lose heart
      setStatus("wrong");
      loseHeart();
      playWrongSound();
    }
  }, [
    selectedOptionId,
    currentChallenge,
    status,
    attemptsLeft,
    addXP,
    loseHeart,
    matchPairs,
    matchLeftItems,
    matchRightItems,
    showBonusRound,
    bonusChallenge,
    XP_PER_CORRECT,
    conversationalInput,
  ]);

  const handleNext = useCallback(() => {
    // Reset attempts for next challenge
    setAttemptsLeft(3);
    setMatchPairs({});
    setMatchCorrectPairs({});
    setMatchSelectedLeft(null);
    // Reset conversational state
    setConversationalInput("");
    setGradeFeedback("");
    setGradeScore(undefined);

    if (currentIndex >= totalChallenges - 1 || showBonusRound) {
      if (!showBonusRound) {
        // Show bonus round first
        const randomBonus = bonusQuestions[Math.floor(Math.random() * bonusQuestions.length)];
        const shuffledOptions = [
          { id: "bonus-correct", text: randomBonus.answer, isCorrect: true },
          { id: "bonus-d1", text: randomBonus.distractors[0], isCorrect: false },
          { id: "bonus-d2", text: randomBonus.distractors[1], isCorrect: false },
          { id: "bonus-d3", text: randomBonus.distractors[2], isCorrect: false },
        ].sort(() => Math.random() - 0.5);
        setBonusChallenge({
          question: randomBonus.question,
          answer: randomBonus.answer,
          options: shuffledOptions,
          explanation: randomBonus.explanation,
        });
        setShowBonusRound(true);
        setSelectedOptionId(null);
        setStatus("none");
        return;
      }
      // Bonus already shown -> complete
      setCompleted(true);
      if (mode === "legendary") {
        completeLegendaryModule(module.id);
      }
      completeModule(module.id);
      updateStreak();
      return;
    }

    // Advance to next challenge
    setCurrentIndex((prev) => prev + 1);
    setSelectedOptionId(null);
    setStatus("none");
  }, [currentIndex, totalChallenges, completeModule, completeLegendaryModule, module.id, updateStreak, showBonusRound, mode]);

  // Index-based select for keyboard shortcuts (1-4 keys)
  const handleSelectByIndex = useCallback(
    (index: number) => {
      if (status === "correct" || status === "wrong") return;

      if (showBonusRound && bonusChallenge) {
        const option = bonusChallenge.options[index];
        if (option) {
          if (status === "try-again") setStatus("none");
          setSelectedOptionId(option.id);
        }
        return;
      }

      if (!currentChallenge) return;
      const option = currentChallenge.options[index];
      if (option) {
        if (status === "try-again") setStatus("none");
        setSelectedOptionId(option.id);
      }
    },
    [currentChallenge, status, showBonusRound, bonusChallenge]
  );

  // Wire keyboard shortcuts
  const numOptions = showBonusRound && bonusChallenge
    ? bonusChallenge.options.length
    : currentChallenge?.options.length ?? 0;

  useKeyboardShortcuts({
    numOptions,
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
          <span className="text-6xl">&#x1F494;</span>
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
        mode={mode}
      />
    );
  }

  // Correct answer enrichment for footer
  const correctOption = currentChallenge?.options.find((o) => o.isCorrect);

  // Footer disabled logic
  const footerDisabled = showBonusRound
    ? !selectedOptionId
    : currentChallenge?.type === "MATCH"
    ? Object.keys(matchPairs).length < matchLeftItems.length || status === "try-again"
    : currentChallenge?.type === "CONVERSATIONAL"
    ? !conversationalInput.trim() || isGrading || status === "try-again"
    : !selectedOptionId || status === "try-again";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <LessonHeader
        progress={showBonusRound ? 100 : progress}
        hearts={hearts}
        onClose={handleClose}
      />

      {/* Challenge */}
      <div className="flex flex-1 items-center justify-center pb-24">
        <AnimatePresence mode="wait">
          {/* Bonus Round UI */}
          {showBonusRound && bonusChallenge && (
            <motion.div
              key="bonus-round"
              className="w-full"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full">
                {/* Bonus round header */}
                <div className="mb-3 text-center">
                  <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-600">
                    Bonus Round
                  </span>
                </div>
                {/* Render as a SELECT challenge */}
                <Challenge
                  challenge={{
                    id: "bonus",
                    type: "SELECT",
                    questionText: bonusChallenge.question,
                    correctAnswer: bonusChallenge.answer,
                    options: bonusChallenge.options,
                    vocabId: "",
                  }}
                  selectedOptionId={selectedOptionId}
                  status={status}
                  onSelect={handleSelect}
                />
              </div>
            </motion.div>
          )}

          {/* Regular Challenge */}
          {!showBonusRound && currentChallenge && (
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
                matchLeftItems={matchLeftItems}
                matchRightItems={matchRightItems}
                matchSelectedLeft={matchSelectedLeft}
                matchPairs={matchPairs}
                matchCorrectPairs={matchCorrectPairs}
                onMatchSelectLeft={handleMatchSelectLeft}
                onMatchSelectRight={handleMatchSelectRight}
                conversationalInput={conversationalInput}
                onConversationalInputChange={(val) => {
                  setConversationalInput(val);
                  if (status === "try-again") {
                    setStatus("none");
                    setGradeFeedback("");
                    setGradeScore(undefined);
                  }
                }}
                gradeFeedback={gradeFeedback}
                gradeScore={gradeScore}
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
        disabled={footerDisabled}
        attemptsLeft={attemptsLeft}
        hint={currentChallenge?.hint}
        correctAnswer={
          showBonusRound
            ? bonusChallenge?.answer
            : currentVocabItem?.english ?? correctOption?.text
        }
        correctKhmer={showBonusRound ? undefined : currentVocabItem?.khmer}
        correctRomanized={showBonusRound ? undefined : currentVocabItem?.romanized}
        correctIllustration={showBonusRound ? undefined : currentVocabItem?.imageEmoji}
        vocabContext={showBonusRound ? null : vocabContext}
        isBonus={showBonusRound}
        bonusExplanation={bonusChallenge?.explanation}
        timeLeft={mode === "legendary" && !showBonusRound ? timeLeft : undefined}
      />
    </div>
  );
}
