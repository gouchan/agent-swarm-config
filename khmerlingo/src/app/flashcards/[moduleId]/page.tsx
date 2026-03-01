"use client";

import { useParams, useRouter } from "next/navigation";
import { modules, getModuleById } from "@/data/modules";
import { FlashCardDeck } from "@/components/flashcard/flash-card-deck";

export default function FlashcardPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;
  const lessonModule = getModuleById(moduleId);

  if (!lessonModule) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800">Module not found</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-[#1CB0F6] font-bold hover:underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <FlashCardDeck
      module={lessonModule}
      onComplete={() => router.push(`/learn/${moduleId}`)}
      onExit={() => router.push("/")}
    />
  );
}
