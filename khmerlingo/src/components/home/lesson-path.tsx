"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Check } from "lucide-react";
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
  return (
    <div className="flex flex-col items-center py-8">
      {modules.map((module, index) => {
        const isCompleted = completedModules.includes(module.id);
        const isUnlocked = index <= currentModuleIndex || isCompleted;
        const isCurrent = index === currentModuleIndex && !isCompleted;

        // Zigzag: alternate left/right offset
        const offsetX =
          index % 4 === 0
            ? 0
            : index % 4 === 1
            ? 60
            : index % 4 === 2
            ? 0
            : -60;

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
                  <div
                    className={cn(
                      "relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-b-4 transition-transform hover:scale-110 active:translate-y-[2px] active:border-b-2",
                      isCompleted
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
                        className="absolute -inset-2 rounded-full border-4 border-[#1CB0F6]"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {/* Module label */}
                  <p
                    className={cn(
                      "mt-2 text-center text-xs font-bold",
                      isCompleted
                        ? "text-[#58CC02]"
                        : isCurrent
                        ? "text-[#1CB0F6]"
                        : "text-gray-600"
                    )}
                  >
                    {module.title}
                  </p>
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
