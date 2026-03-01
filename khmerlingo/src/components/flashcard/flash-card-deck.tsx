"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlashCard } from "./flash-card";
import { culturalContext } from "@/data/cultural-context";
import type { Module } from "@/data/types";

interface FlashCardDeckProps {
  module: Module;
  onComplete: () => void;
  onExit: () => void;
}

export function FlashCardDeck({ module, onComplete, onExit }: FlashCardDeckProps) {
  const vocab = module.vocabulary;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());

  const currentVocab = vocab[currentIndex];
  const context = currentVocab ? (culturalContext[currentVocab.id] ?? null) : null;
  const totalCards = vocab.length;
  const knownCount = known.size;
  const progress = totalCards > 0 ? Math.round((knownCount / totalCards) * 100) : 0;
  const allDone = knownCount >= totalCards;

  // Remaining cards to study
  const remaining = useMemo(
    () => vocab.filter((v) => !known.has(v.id)),
    [vocab, known]
  );

  const flipCard = useCallback(() => setIsFlipped((f) => !f), []);

  const goNext = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < totalCards - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 150);
  }, [currentIndex, totalCards]);

  const goPrev = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      } else {
        setCurrentIndex(totalCards - 1);
      }
    }, 150);
  }, [currentIndex, totalCards]);

  const markKnown = useCallback(() => {
    if (!currentVocab) return;
    setKnown((prev) => new Set(prev).add(currentVocab.id));
    goNext();
  }, [currentVocab, goNext]);

  const markStudyAgain = useCallback(() => {
    setKnown((prev) => {
      const next = new Set(prev);
      if (currentVocab) next.delete(currentVocab.id);
      return next;
    });
    goNext();
  }, [currentVocab, goNext]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          flipCard();
          break;
        case "ArrowRight":
        case "k":
          e.preventDefault();
          if (isFlipped) markKnown();
          else goNext();
          break;
        case "ArrowLeft":
        case "r":
          e.preventDefault();
          if (isFlipped) markStudyAgain();
          else goPrev();
          break;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipCard, goNext, goPrev, markKnown, markStudyAgain, isFlipped]);

  // All cards mastered
  if (allDone) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-7xl">🎉</span>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-800">
            All Cards Mastered!
          </h2>
          <p className="mt-2 text-gray-500">
            You&apos;ve reviewed all {totalCards} cards in {module.title}.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => {
              setKnown(new Set());
              setCurrentIndex(0);
              setIsFlipped(false);
            }}>
              <RotateCcw size={16} className="mr-2" />
              Study Again
            </Button>
            <Button variant="default" onClick={onComplete}>
              Continue to Quiz
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <button
          onClick={onExit}
          className="text-sm font-bold text-slate-400 hover:text-slate-600"
        >
          Exit
        </button>
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {module.title} — Flashcards
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {knownCount}/{totalCards} mastered
          </p>
        </div>
        <div className="w-12" />
      </div>

      {/* Progress bar */}
      <div className="mx-4 mt-3 h-3 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[#58CC02]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Card area */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-4">
        <AnimatePresence mode="wait">
          {currentVocab && (
            <motion.div
              key={currentVocab.id}
              className="w-full"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
            >
              <FlashCard
                vocab={currentVocab}
                context={context}
                isFlipped={isFlipped}
                onFlip={flipCard}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={goPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 text-slate-400 hover:bg-slate-50"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold text-slate-500 tabular-nums min-w-[4rem] text-center">
            {currentIndex + 1} / {totalCards}
          </span>
          <button
            onClick={goNext}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 text-slate-400 hover:bg-slate-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Know / Study Again buttons — only when flipped */}
        {isFlipped && (
          <motion.div
            className="mt-4 flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button variant="secondary" onClick={markStudyAgain}>
              <RotateCcw size={14} className="mr-1.5" />
              Study Again
            </Button>
            <Button variant="default" onClick={markKnown}>
              <Check size={14} className="mr-1.5" />
              Know It
            </Button>
          </motion.div>
        )}

        {/* Remaining chips */}
        {remaining.length < totalCards && remaining.length > 0 && (
          <p className="mt-3 text-xs text-slate-400">
            {remaining.length} card{remaining.length !== 1 ? "s" : ""} left to master
          </p>
        )}

        {/* Keyboard hint */}
        <p className="mt-4 text-[10px] text-slate-300 hidden md:block">
          Space/Enter: flip · Arrow keys: navigate · K: know it · R: study again
        </p>
      </div>
    </div>
  );
}
