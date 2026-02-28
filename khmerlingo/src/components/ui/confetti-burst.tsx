"use client";

import { useState, useEffect } from "react";
import ReactConfetti from "react-confetti";

interface ConfettiBurstProps {
  duration?: number;
}

export function ConfettiBurst({ duration = 3000 }: ConfettiBurstProps) {
  const [isRunning, setIsRunning] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 800,
    height: typeof window !== "undefined" ? window.innerHeight : 600,
  });

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
        numberOfPieces={isRunning ? 200 : 0}
        colors={["#58CC02", "#1CB0F6", "#FAA918", "#E53838", "#8549BA"]}
        gravity={0.3}
      />
    </div>
  );
}
