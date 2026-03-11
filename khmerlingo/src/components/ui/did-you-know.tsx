"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronRight } from "lucide-react";
import { didYouKnowFacts } from "@/data/cultural-context";

interface DidYouKnowProps {
  className?: string;
}

export function DidYouKnow({ className }: DidYouKnowProps) {
  const [factIndex, setFactIndex] = useState(0);

  // Pick a random starting fact on mount
  useEffect(() => {
    setFactIndex(Math.floor(Math.random() * didYouKnowFacts.length));
  }, []);

  function nextFact() {
    setFactIndex((prev) => (prev + 1) % didYouKnowFacts.length);
  }

  const fact = didYouKnowFacts[factIndex];

  return (
    <div className={`bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 ${className ?? ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-200 flex items-center justify-center">
          <Lightbulb className="h-4 w-4 text-amber-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">
            Did You Know? 🇰🇭
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              className="text-sm text-amber-900 leading-relaxed"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {fact}
            </motion.p>
          </AnimatePresence>
        </div>
        <button
          onClick={nextFact}
          className="flex-shrink-0 p-1.5 rounded-lg text-amber-500 hover:text-amber-700 hover:bg-amber-100 transition-colors"
          title="Next fact"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
