"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeartProps {
  filled: boolean;
  className?: string;
}

export function Heart({ filled, className }: HeartProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={filled ? "filled" : "empty"}
        className={cn("inline-block text-xl", className)}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {filled ? (
          <span className="text-[#E53838]" role="img" aria-label="full heart">
            ❤️
          </span>
        ) : (
          <span className="text-gray-400" role="img" aria-label="empty heart">
            🩶
          </span>
        )}
      </motion.span>
    </AnimatePresence>
  );
}

interface HeartDisplayProps {
  count: number;
  max?: number;
  className?: string;
}

export function HeartDisplay({ count, max = 5, className }: HeartDisplayProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Heart key={i} filled={i < count} />
      ))}
    </div>
  );
}
