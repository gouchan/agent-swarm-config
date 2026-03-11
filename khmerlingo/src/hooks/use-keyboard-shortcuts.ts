"use client";

import { useEffect } from "react";

interface Options {
  numOptions: number;
  onSelect: (index: number) => void;
  onCheck: () => void;
  onNext: () => void;
  status: "none" | "try-again" | "correct" | "wrong";
  disabled: boolean;
}

/**
 * Desktop keyboard shortcuts for the quiz:
 * 1-4 → select answer option
 * Enter / Space → Check (when answer selected) or Continue (when status != none)
 * Escape → ignored (avoid accidental close)
 */
export function useKeyboardShortcuts({
  numOptions,
  onSelect,
  onCheck,
  onNext,
  status,
  disabled,
}: Options) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Don't fire if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      // Number keys 1–4 — allow selection during none and try-again
      if (e.key >= "1" && e.key <= "4") {
        const idx = parseInt(e.key) - 1;
        if (idx < numOptions && (status === "none" || status === "try-again")) {
          onSelect(idx);
        }
        return;
      }

      // Enter / Space
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (status === "correct" || status === "wrong") {
          onNext();
        } else if (status === "none" && !disabled) {
          onCheck();
        }
        // During try-again: Enter does nothing — user must re-select first
        return;
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [numOptions, onSelect, onCheck, onNext, status, disabled]);
}
