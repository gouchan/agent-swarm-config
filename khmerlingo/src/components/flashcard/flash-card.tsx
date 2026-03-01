"use client";

import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { speakKhmer } from "@/lib/audio";
import type { VocabItem } from "@/data/types";
import type { VocabContext } from "@/data/cultural-context";

interface FlashCardProps {
  vocab: VocabItem;
  context?: VocabContext | null;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashCard({ vocab, context, isFlipped, onFlip }: FlashCardProps) {
  return (
    <div
      className="mx-auto w-full max-w-md cursor-pointer select-none"
      style={{ perspective: 1000 }}
      onClick={onFlip}
    >
      <motion.div
        className="relative h-80 w-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ── FRONT ─────────────────────────────────────── */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-slate-200 border-b-4 bg-white px-6 shadow-md"
          style={{ backfaceVisibility: "hidden" }}
        >
          {vocab.imageEmoji && (
            <span className="text-6xl mb-4">{vocab.imageEmoji}</span>
          )}
          <p
            className="text-4xl font-bold text-slate-800 text-center leading-snug"
            style={{ fontFamily: "'Noto Sans Khmer', sans-serif" }}
          >
            {vocab.khmer}
          </p>
          <p className="mt-6 text-sm font-medium text-slate-400 animate-pulse">
            Tap to reveal
          </p>
        </div>

        {/* ── BACK ──────────────────────────────────────── */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-[#1CB0F6] border-b-4 bg-gradient-to-b from-blue-50 to-white px-6 shadow-md overflow-y-auto"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-2xl font-extrabold text-[#1CB0F6] text-center">
            {vocab.english}
          </p>
          <p className="mt-1 text-base italic text-slate-500">
            {vocab.romanized}
          </p>

          {/* Audio button */}
          <button
            className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#1CB0F6] px-4 py-2 text-sm font-bold text-white transition-all active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              speakKhmer(vocab.khmer);
            }}
          >
            <Volume2 size={16} />
            Listen
          </button>

          {/* Cultural note */}
          {context?.mnemonic && (
            <div className="mt-3 rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-2 w-full">
              <p className="text-xs font-bold text-yellow-700 mb-0.5">Memory Trick</p>
              <p className="text-xs text-yellow-800 leading-relaxed">
                {context.mnemonic}
              </p>
            </div>
          )}

          {context?.funFact && (
            <div className="mt-2 rounded-xl bg-purple-50 border border-purple-200 px-4 py-2 w-full">
              <p className="text-xs font-bold text-purple-700 mb-0.5">Fun Fact</p>
              <p className="text-xs text-purple-800 leading-relaxed">
                {context.funFact}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
