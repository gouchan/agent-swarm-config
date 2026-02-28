"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Module } from "@/data/types";

interface UnitBannerProps {
  module: Module;
  isUnlocked: boolean;
  isCompleted?: boolean;
  onStart?: () => void;
}

export function UnitBanner({
  module,
  isUnlocked,
  isCompleted = false,
  onStart,
}: UnitBannerProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        isUnlocked ? module.color : "bg-gray-300"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-4 -top-4 text-[120px] leading-none">
          {module.icon}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Module Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-4xl backdrop-blur-sm">
            {isUnlocked ? module.icon : <Lock className="text-white" size={28} />}
          </div>

          {/* Module Info */}
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              {module.title}
            </h2>
            <p className="text-lg font-bold text-white/80">
              {module.titleKhmer}
            </p>
            <p className="mt-1 text-sm text-white/70">{module.description}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          {isUnlocked ? (
            <Button
              variant="secondary"
              size="lg"
              onClick={onStart}
              className="bg-white font-extrabold text-gray-800 hover:bg-gray-100"
            >
              {isCompleted ? "Practice" : "Start"}
            </Button>
          ) : (
            <div className="flex h-12 items-center rounded-xl bg-white/20 px-6 font-bold text-white/70">
              <Lock size={16} className="mr-2" />
              Locked
            </div>
          )}
        </div>
      </div>

      {/* Completed badge */}
      {isCompleted && (
        <motion.div
          className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-bold text-[#58CC02]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          ✓ Complete
        </motion.div>
      )}
    </motion.div>
  );
}
