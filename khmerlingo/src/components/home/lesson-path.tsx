"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Check, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Module } from "@/data/types";

interface LessonPathProps {
  modules: Module[];
  completedModules: string[];
  currentModuleIndex: number;
}

export function LessonPath({
  modules,
  completedModules,
  currentModuleIndex,
}: LessonPathProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center py-8">
      {modules.map((module, index) => {
        const isCompleted = completedModules.includes(module.id);
        const isUnlocked = index <= currentModuleIndex || isCompleted;
        const isCurrent = index === currentModuleIndex && !isCompleted;

        // Zigzag: alternate left/right offset (reduced for mobile safety)
        const offsetX =
          index % 4 === 0
            ? 0
            : index % 4 === 1
            ? 48
            : index % 4 === 2
            ? 0
            : -48;

        return (
          <div key={module.id} className="flex flex-col items-center">
            {/* Connector line (except for first node) */}
            {index > 0 && (
              <div
                className={cn(
                  "h-8 w-1 rounded-full",
                  isUnlocked ? "bg-[#58CC02]" : "bg-gray-300"
                )}
              />
            )}

            {/* Lesson Node */}
            <motion.div
              style={{ transform: `translateX(${offsetX}px)` }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
            >
              {isUnlocked ? (
                <Link href={`/learn/${module.id}`}>
                  {/* Sidequest label badge */}
                  {module.type === "sidequest" && (
                    <p className="text-center text-[9px] font-extrabold uppercase tracking-widest text-amber-500 mb-1">
                      ⭐ Sidequest
                    </p>
                  )}

                  <div
                    className={cn(
                      "relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-b-4 transition-transform hover:scale-110 active:translate-y-[2px] active:border-b-2",
                      module.type === "sidequest"
                        ? isCompleted
                          ? "border-b-amber-600 bg-amber-500"
                          : isCurrent
                          ? "border-b-purple-600 bg-purple-500 ring-4 ring-purple-400/30"
                          : "border-b-amber-600 bg-amber-500"
                        : isCompleted
                        ? "border-b-[#45A002] bg-[#58CC02]"
                        : isCurrent
                        ? "border-b-[#1899D6] bg-[#1CB0F6] ring-4 ring-[#1CB0F6]/30"
                        : "border-b-[#45A002] bg-[#58CC02]"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="text-white" size={32} strokeWidth={3} />
                    ) : (
                      <span className="text-3xl">{module.icon}</span>
                    )}

                    {/* Current indicator pulse */}
                    {isCurrent && (
                      <motion.div
                        className={cn(
                          "absolute -inset-2 rounded-full border-4",
                          module.type === "sidequest"
                            ? "border-purple-400"
                            : "border-[#1CB0F6]"
                        )}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {/* Module label */}
                  <p
                    className={cn(
                      "mt-2 text-center text-xs font-bold",
                      module.type === "sidequest"
                        ? isCompleted
                          ? "text-amber-600"
                          : isCurrent
                          ? "text-purple-600"
                          : "text-amber-500"
                        : isCompleted
                        ? "text-[#58CC02]"
                        : isCurrent
                        ? "text-[#1CB0F6]"
                        : "text-gray-600"
                    )}
                  >
                    {module.title}
                  </p>

                  {/* Flashcard study link — only for vocabulary modules */}
                  {module.type !== "sidequest" && (isCompleted || isCurrent) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/flashcards/${module.id}`);
                      }}
                      className="mt-1 flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 hover:text-[#1CB0F6] transition-colors"
                    >
                      <BookOpen size={10} />
                      Study Cards
                    </button>
                  )}
                </Link>
              ) : (
                <div>
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-b-4 border-b-gray-400 bg-gray-300">
                    <Lock className="text-gray-500" size={28} />
                  </div>
                  <p className="mt-2 text-center text-xs font-bold text-gray-400">
                    {module.title}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
