"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, ArrowLeftRight, X, Loader2 } from "lucide-react";

type Lang = "en" | "km";

export function TranslateWidget() {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<Lang>("en");
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const to: Lang = from === "en" ? "km" : "en";

  function swap() {
    setFrom(to);
    setInputText(result);
    setResult(inputText);
  }

  async function doTranslate(text: string) {
    if (!text.trim()) {
      setResult("");
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setResult("");
      } else {
        setResult(data.translation ?? "");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  function handleInput(value: string) {
    setInputText(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doTranslate(value), 700);
  }

  const langLabel: Record<Lang, string> = {
    en: "English",
    km: "ខ្មែរ (Khmer)",
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#1CB0F6] text-white shadow-lg flex items-center justify-center hover:bg-[#1899D6] transition-colors"
        title="Translate English ↔ Khmer"
      >
        <Languages className="h-5 w-5" />
      </button>

      {/* Widget panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-20 right-6 z-40 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-[#1CB0F6] px-4 py-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Languages className="h-4 w-4" />
                KhmerLingo Translate
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Language direction bar */}
              <div className="flex items-center gap-2">
                <span className="flex-1 text-center text-xs font-bold text-slate-600 bg-slate-100 rounded-xl py-1.5">
                  {langLabel[from]}
                </span>
                <button
                  onClick={swap}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-[#1CB0F6]/10 hover:text-[#1CB0F6] transition-colors"
                  title="Swap languages"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                </button>
                <span className="flex-1 text-center text-xs font-bold text-slate-600 bg-slate-100 rounded-xl py-1.5">
                  {langLabel[to]}
                </span>
              </div>

              {/* Input */}
              <textarea
                className="w-full h-20 text-sm border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#1CB0F6]/40 text-slate-800 placeholder:text-slate-300"
                placeholder={from === "en" ? "Type English..." : "សរសេរជាភាសាខ្មែរ..."}
                value={inputText}
                onChange={(e) => handleInput(e.target.value)}
                style={from === "km" ? { fontFamily: "'Noto Sans Khmer', sans-serif" } : {}}
              />

              {/* Output */}
              <div className="min-h-[60px] bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                {loading ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Translating...
                  </div>
                ) : error ? (
                  <p className="text-rose-500 text-xs">{error}</p>
                ) : result ? (
                  <p
                    className="text-slate-800 text-sm leading-relaxed"
                    style={to === "km" ? { fontFamily: "'Noto Sans Khmer', sans-serif" } : {}}
                  >
                    {result}
                  </p>
                ) : (
                  <p className="text-slate-300 text-sm">Translation appears here</p>
                )}
              </div>

              <p className="text-center text-[10px] text-slate-300">
                Powered by KhmerLingo · For learning use only
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
