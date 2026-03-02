"use client";

import { useState, useEffect } from "react";
import ReactConfetti from "react-confetti";

interface ConfettiBurstProps {
  duration?: number;
  numberOfPieces?: number;
  colors?: string[];
}

export function ConfettiBurst({ duration = 3000, numberOfPieces = 200, colors }: ConfettiBurstProps) {
  const confettiColors = colors ?? ["#58CC02", "#1CB0F6", "#FAA918", "#E53838", "#8549BA"];
  const [isRunning, setIsRunning] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const timer = setTimeout(() => {
      setIsRunning(false);
    }, duration);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [duration]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <ReactConfetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={isRunning ? numberOfPieces : 0}
        colors={confettiColors}
        gravity={0.3}
      />
    </div>
  );
}
