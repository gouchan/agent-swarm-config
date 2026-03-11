"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Volume2, Loader2, Star, RotateCcw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { conversations, type ConversationScenario, type ConversationTurn } from "@/data/conversations";
import { speakKhmer } from "@/lib/audio";
import { useGameStore } from "@/store/game-store";

type MessageStatus = "pending" | "correct" | "close" | "wrong" | "info";

interface ChatMessage {
  id: string;
  speaker: "bot" | "user" | "system";
  khmer?: string;
  english: string;
  romanized?: string;
  status?: MessageStatus;
  feedback?: string;
  score?: number;
}

// ── Scenario selector ──────────────────────────────────────────────────────

function ScenarioList({ onSelect }: { onSelect: (s: ConversationScenario) => void }) {
  const difficultyColor = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-amber-100 text-amber-700",
    advanced: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:px-6">
        <Link href="/" className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-extrabold text-gray-800">Conversation Practice</h1>
      </header>

      <div className="flex-1 px-4 py-6 md:px-6 max-w-2xl mx-auto w-full">
        <p className="text-gray-500 text-sm mb-6">
          Practice real conversations in Khmer. Type your responses and get instant feedback!
        </p>

        <div className="grid gap-4">
          {conversations.map((scenario) => (
            <motion.button
              key={scenario.id}
              onClick={() => onSelect(scenario)}
              className="flex items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white p-4 text-left transition-all hover:border-[#1CB0F6] hover:shadow-md active:scale-[0.98]"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 text-3xl flex-shrink-0">
                {scenario.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-gray-800">{scenario.title}</h3>
                  <span className={cn("text-xs font-bold rounded-full px-2 py-0.5", difficultyColor[scenario.difficulty])}>
                    {scenario.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{scenario.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  <span className="font-bold text-amber-500">+{scenario.xpReward} XP</span>
                  {" · "}
                  {scenario.turns.filter((t) => t.speaker === "user").length} responses
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Chat interface ─────────────────────────────────────────────────────────

function ChatInterface({
  scenario,
  onBack,
}: {
  scenario: ConversationScenario;
  onBack: () => void;
}) {
  const MAX_RETRIES_PER_TURN = 3;
  const { addXP, updateStreak } = useGameStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [userTurnCount, setUserTurnCount] = useState(0);
  const [retriesLeft, setRetriesLeft] = useState(MAX_RETRIES_PER_TURN);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  // Start the conversation by playing the first bot message
  useEffect(() => {
    if (messages.length === 0 && scenario.turns.length > 0) {
      playNextBotTurns(0);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Play all consecutive bot turns starting from index */
  function playNextBotTurns(fromIndex: number) {
    let idx = fromIndex;
    const newMessages: ChatMessage[] = [];

    while (idx < scenario.turns.length && scenario.turns[idx].speaker === "bot") {
      const turn = scenario.turns[idx];
      newMessages.push({
        id: `turn-${idx}`,
        speaker: "bot",
        khmer: turn.khmer,
        english: turn.english,
        romanized: turn.romanized,
      });
      idx++;
    }

    // If the next turn is a user turn, add a prompt
    if (idx < scenario.turns.length && scenario.turns[idx].speaker === "user") {
      newMessages.push({
        id: `prompt-${idx}`,
        speaker: "system",
        english: scenario.turns[idx].english,
        status: "info",
      });
    }

    setMessages((prev) => [...prev, ...newMessages]);
    setTurnIndex(idx);
    scrollToBottom();
  }

  async function handleSend() {
    if (!inputValue.trim() || isGrading || isComplete) return;

    const currentTurn = scenario.turns[turnIndex];
    if (!currentTurn || currentTurn.speaker !== "user") return;

    setIsGrading(true);

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${turnIndex}`,
      speaker: "user",
      khmer: inputValue,
      english: "",
      status: "pending",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    scrollToBottom();

    try {
      const res = await fetch("/api/grade-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAnswer: inputValue,
          correctAnswer: currentTurn.khmer,
          acceptedAnswers: currentTurn.acceptedAnswers ?? [],
        }),
      });
      if (!res.ok) throw new Error(`Grade API ${res.status}`);
      const data = await res.json();

      const status: MessageStatus = data.correct
        ? "correct"
        : data.score >= 60
        ? "close"
        : "wrong";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsg.id
            ? { ...m, status, feedback: data.feedback, score: data.score }
            : m
        )
      );

      setTotalScore((prev) => prev + (data.score ?? 0));
      setUserTurnCount((prev) => prev + 1);

      if (data.correct) {
        // Reset retries for next turn
        setRetriesLeft(MAX_RETRIES_PER_TURN);
        // Advance to next turns
        const nextIdx = turnIndex + 1;
        if (nextIdx >= scenario.turns.length) {
          // Conversation complete!
          setIsComplete(true);
          addXP(scenario.xpReward);
          updateStreak();
          setMessages((prev) => [
            ...prev,
            {
              id: "complete",
              speaker: "system",
              english: `Conversation complete! +${scenario.xpReward} XP earned!`,
              status: "correct",
            },
          ]);
        } else {
          // Play next bot turns after a short delay
          setTimeout(() => playNextBotTurns(nextIdx), 800);
        }
      } else {
        const newRetries = retriesLeft - 1;
        setRetriesLeft(newRetries);

        if (newRetries <= 0) {
          // Out of retries — show correct answer and advance
          setMessages((prev) => [
            ...prev,
            {
              id: `answer-${turnIndex}`,
              speaker: "system",
              english: `Correct answer: ${currentTurn.khmer} (${currentTurn.romanized})`,
              status: "info",
            },
          ]);
          setRetriesLeft(MAX_RETRIES_PER_TURN);
          const nextIdx = turnIndex + 1;
          if (nextIdx >= scenario.turns.length) {
            setIsComplete(true);
            addXP(Math.max(5, Math.floor(scenario.xpReward / 2))); // partial XP
            updateStreak();
            setMessages((prev) => [
              ...prev,
              {
                id: "complete",
                speaker: "system",
                english: `Conversation complete! +${Math.max(5, Math.floor(scenario.xpReward / 2))} XP earned.`,
                status: "correct",
              },
            ]);
          } else {
            setTimeout(() => playNextBotTurns(nextIdx), 800);
          }
        } else {
          // Show hint and retries remaining
          const hintMsg = currentTurn.hint ? `Hint: ${currentTurn.hint}` : "Try again!";
          setMessages((prev) => [
            ...prev,
            {
              id: `hint-${turnIndex}-${newRetries}`,
              speaker: "system",
              english: `${hintMsg} (${newRetries} ${newRetries === 1 ? "try" : "tries"} left)`,
              status: "info",
            },
          ]);
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsg.id ? { ...m, status: "wrong", feedback: "Grading error — try again" } : m
        )
      );
    } finally {
      setIsGrading(false);
      scrollToBottom();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const averageScore = userTurnCount > 0 ? Math.round(totalScore / userTurnCount) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:px-6 shadow-sm">
        <button onClick={onBack} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-extrabold text-gray-800 truncate">
            {scenario.icon} {scenario.title}
          </h1>
          <p className="text-xs text-gray-400">{scenario.titleKhmer}</p>
        </div>
        {isComplete && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-[#1CB0F6] bg-[#1CB0F6]/10 rounded-full px-3 py-1.5 hover:bg-[#1CB0F6]/20 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            New
          </button>
        )}
      </header>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 max-w-2xl mx-auto w-full space-y-3">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn(
                "flex",
                msg.speaker === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.speaker === "system" ? (
                <div
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-medium text-center w-full max-w-md mx-auto",
                    msg.status === "correct"
                      ? "bg-green-100 text-green-800"
                      : msg.status === "info"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {msg.english}
                </div>
              ) : msg.speaker === "bot" ? (
                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white border border-gray-200 px-4 py-3 shadow-sm">
                  {msg.khmer && (
                    <div className="flex items-start gap-2">
                      <p
                        className="text-lg font-bold text-gray-800"
                        style={{ fontFamily: "'Noto Sans Khmer', sans-serif" }}
                      >
                        {msg.khmer}
                      </p>
                      <button
                        onClick={() => msg.khmer && speakKhmer(msg.khmer)}
                        className="p-1 rounded-lg text-[#1CB0F6] hover:bg-[#1CB0F6]/10 transition-colors flex-shrink-0 mt-0.5"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-1">{msg.english}</p>
                  {msg.romanized && (
                    <p className="text-xs text-gray-400 italic mt-0.5">/{msg.romanized}/</p>
                  )}
                </div>
              ) : (
                /* User message */
                <div className="max-w-[85%]">
                  <div
                    className={cn(
                      "rounded-2xl rounded-br-md px-4 py-3",
                      msg.status === "correct"
                        ? "bg-[#58CC02] text-white"
                        : msg.status === "close"
                        ? "bg-amber-400 text-white"
                        : msg.status === "wrong"
                        ? "bg-rose-400 text-white"
                        : "bg-[#1CB0F6] text-white"
                    )}
                  >
                    <p
                      className="text-lg font-bold"
                      style={{ fontFamily: "'Noto Sans Khmer', sans-serif" }}
                    >
                      {msg.khmer}
                    </p>
                  </div>
                  {msg.feedback && (
                    <p
                      className={cn(
                        "text-xs mt-1 px-1",
                        msg.status === "correct"
                          ? "text-green-600"
                          : msg.status === "close"
                          ? "text-amber-600"
                          : "text-rose-500"
                      )}
                    >
                      {msg.feedback}
                      {msg.score !== undefined && (
                        <span className="ml-1 opacity-60">({msg.score}%)</span>
                      )}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Completion card */}
      {isComplete && (
        <motion.div
          className="border-t border-gray-200 bg-white px-4 py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-md mx-auto text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(3)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-6 w-6",
                    averageScore >= (i + 1) * 30
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <p className="text-sm font-bold text-gray-800">
              Average accuracy: {averageScore}%
            </p>
            <Link
              href="/practice"
              className="mt-3 inline-block rounded-xl border-b-4 border-b-[#1899D6] bg-[#1CB0F6] px-6 py-2.5 text-sm font-bold text-white transition-all hover:brightness-105 active:translate-y-[2px] active:border-b-2"
            >
              Try Another Conversation
            </Link>
          </div>
        </motion.div>
      )}

      {/* Input bar */}
      {!isComplete && (
        <div className="sticky bottom-0 border-t border-gray-200 bg-white px-4 py-3 md:px-6">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type in Khmer..."
              maxLength={200}
              disabled={isGrading}
              className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-base font-medium text-gray-800 placeholder:text-gray-300 focus:border-[#1CB0F6] focus:outline-none focus:ring-2 focus:ring-[#1CB0F6]/20 transition-colors disabled:opacity-50"
              style={{ fontFamily: "'Noto Sans Khmer', sans-serif" }}
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isGrading}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl transition-all",
                inputValue.trim() && !isGrading
                  ? "bg-[#1CB0F6] text-white hover:bg-[#1899D6] active:scale-95"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              )}
            >
              {isGrading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-300 mt-1">
            Press Enter to send
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main practice page ─────────────────────────────────────────────────────

export default function PracticePage() {
  const [selectedScenario, setSelectedScenario] = useState<ConversationScenario | null>(null);

  if (selectedScenario) {
    return (
      <ChatInterface
        scenario={selectedScenario}
        onBack={() => setSelectedScenario(null)}
      />
    );
  }

  return <ScenarioList onSelect={setSelectedScenario} />;
}
