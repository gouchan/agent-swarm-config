"use client";

import { useParams, notFound } from "next/navigation";
import { useState } from "react";
import { getModuleById } from "@/data/modules";
import { Quiz } from "@/components/lesson/quiz";
import { motion } from "framer-motion";
import { Zap, BookOpen } from "lucide-react";
import Link from "next/link";

export type LessonMode = 'normal' | 'legendary';

function ModeSelector({ module, onSelect }: { module: { id: string; title: string; icon: string }; onSelect: (mode: LessonMode) => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="text-5xl">{module.icon}</span>
          <h1 className="mt-3 text-2xl font-extrabold text-gray-800">{module.title}</h1>
          <p className="mt-1 text-gray-500 text-sm">Choose your challenge level</p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Normal */}
          <motion.button
            onClick={() => onSelect('normal')}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white p-5 text-center transition-all hover:border-[#1CB0F6] hover:shadow-md active:scale-95"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
              <BookOpen className="text-[#1CB0F6]" size={28} />
            </div>
            <div>
              <p className="text-lg font-extrabold text-gray-800">Normal</p>
              <p className="mt-0.5 text-xs text-gray-400">No time limit</p>
              <p className="text-xs text-gray-400">+10 XP per correct</p>
            </div>
            <div className="mt-1 rounded-xl border-b-4 border-b-[#1899D6] bg-[#1CB0F6] px-5 py-2 text-sm font-bold text-white transition-all hover:brightness-105">
              Start
            </div>
          </motion.button>

          {/* Legendary */}
          <motion.button
            onClick={() => onSelect('legendary')}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 text-center transition-all hover:border-amber-400 hover:shadow-md active:scale-95"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
              <Zap className="text-amber-500" size={28} />
            </div>
            <div>
              <p className="text-lg font-extrabold text-amber-800">Legendary</p>
              <p className="mt-0.5 text-xs text-amber-600">Timed challenges!</p>
              <p className="text-xs text-amber-600">+20 XP per correct</p>
            </div>
            <div className="mt-1 rounded-xl border-b-4 border-b-amber-600 bg-amber-500 px-5 py-2 text-sm font-bold text-white transition-all hover:brightness-105">
              Start
            </div>
          </motion.button>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">&larr; Back to home</Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function LearnPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const [mode, setMode] = useState<LessonMode | null>(null);

  const lessonModule = getModuleById(moduleId);

  if (!lessonModule) {
    notFound();
  }

  if (!mode) {
    return (
      <div className="min-h-screen bg-white">
        <ModeSelector module={lessonModule} onSelect={setMode} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Quiz module={lessonModule} mode={mode} />
    </div>
  );
}
