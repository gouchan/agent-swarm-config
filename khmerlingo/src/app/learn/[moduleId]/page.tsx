"use client";

import { useParams, notFound } from "next/navigation";
import { getModuleById } from "@/data/modules";
import { Quiz } from "@/components/lesson/quiz";

export default function LearnPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;

  const lessonModule = getModuleById(moduleId);

  if (!lessonModule) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <Quiz module={lessonModule} />
    </div>
  );
}
