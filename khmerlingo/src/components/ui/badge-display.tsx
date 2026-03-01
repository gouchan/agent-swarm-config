"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BadgeDefinition } from "@/data/types";

interface BadgeDisplayProps {
  badge: BadgeDefinition;
  earned?: boolean;
  className?: string;
}

export function BadgeDisplay({
  badge,
  earned = false,
  className,
}: BadgeDisplayProps) {
  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 rounded-xl border-2 p-4 transition-colors",
        earned
          ? "border-[#FAA918] bg-yellow-50"
          : "border-gray-200 bg-gray-50 opacity-50 grayscale",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: earned ? 1 : 0.5, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="text-4xl" role="img" aria-label={badge.name}>
        {badge.icon}
      </span>
      <div className="flex flex-col">
        <span className="font-bold text-gray-800">{badge.name}</span>
        <span className="text-sm text-gray-500">{badge.description}</span>
      </div>
      {earned && (
        <motion.span
          className="ml-auto text-[#58CC02] text-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        >
          ✓
        </motion.span>
      )}
    </motion.div>
  );
}
