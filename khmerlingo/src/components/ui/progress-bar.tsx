"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-gray-200",
        className
      )}
    >
      <motion.div
        className="h-full rounded-full bg-[#58CC02]"
        initial={{ width: 0 }}
        animate={{ width: `${clampedValue}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      {clampedValue > 0 && (
        <motion.div
          className="absolute left-0 top-0 h-[40%] rounded-full bg-white/30"
          style={{ marginLeft: "4px", marginTop: "3px" }}
          initial={{ width: 0 }}
          animate={{
            width: `calc(${clampedValue}% - 8px)`,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}
    </div>
  );
}
