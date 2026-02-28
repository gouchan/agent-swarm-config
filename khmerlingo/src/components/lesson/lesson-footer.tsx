"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LessonFooterProps {
  status: "none" | "correct" | "wrong" | "completed";
  onCheck: () => void;
  onNext: () => void;
  disabled: boolean;
  correctAnswer?: string;
}

export function LessonFooter({
  status,
  onCheck,
  onNext,
  disabled,
  correctAnswer,
}: LessonFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t-2 border-gray-200">
      <AnimatePresence mode="wait">
        {status === "none" && (
          <motion.div
            key="check"
            className="flex items-center justify-end bg-white px-6 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={onCheck}
              disabled={disabled}
              className="min-w-[140px]"
            >
              Check
            </Button>
          </motion.div>
        )}

        {status === "correct" && (
          <motion.div
            key="correct"
            className="flex items-center justify-between bg-green-100 px-6 py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <span className="text-lg font-bold text-[#58CC02]">
                Correct!
              </span>
            </div>
            <Button
              variant="default"
              size="lg"
              onClick={onNext}
              className="min-w-[140px]"
            >
              Continue
            </Button>
          </motion.div>
        )}

        {status === "wrong" && (
          <motion.div
            key="wrong"
            className="flex items-center justify-between bg-rose-100 px-6 py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">❌</span>
                <span className="text-lg font-bold text-[#E53838]">Wrong</span>
              </div>
              {correctAnswer && (
                <p className="text-sm font-semibold text-[#E53838]">
                  Correct answer:{" "}
                  <span className="font-bold">{correctAnswer}</span>
                </p>
              )}
            </div>
            <Button
              variant="danger"
              size="lg"
              onClick={onNext}
              className="min-w-[140px]"
            >
              Got it
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
