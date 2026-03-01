"use client";

import { X } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Heart } from "@/components/ui/heart";

interface LessonHeaderProps {
  progress: number;
  hearts: number;
  onClose: () => void;
}

export function LessonHeader({ progress, hearts, onClose }: LessonHeaderProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      {/* Close button */}
      <button
        onClick={onClose}
        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        aria-label="Close lesson"
      >
        <X size={24} />
      </button>

      {/* Progress bar */}
      <div className="flex-1">
        <ProgressBar value={progress} className="h-3" />
      </div>

      {/* Hearts */}
      <div className="flex items-center gap-1">
        <Heart filled={true} className="text-base" />
        <span className="text-sm font-bold text-[#E53838]">{hearts}</span>
      </div>
    </div>
  );
}
