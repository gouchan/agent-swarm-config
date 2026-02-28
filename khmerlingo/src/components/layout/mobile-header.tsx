"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/store/game-store";
import { formatXP } from "@/lib/utils";

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { xp, hearts } = useGameStore();

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b-2 border-gray-200 bg-white px-4 md:hidden">
        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🇰🇭</span>
          <span className="text-lg font-extrabold text-gray-800">
            KhmerLingo
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm font-bold text-[#FAA918]">
            <span>⚡</span>
            {formatXP(xp)}
          </span>
          <span className="flex items-center gap-1 text-sm font-bold text-[#E53838]">
            <span>❤️</span>
            {hearts}
          </span>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="absolute left-0 top-0 h-full w-64 bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center gap-2">
              <span className="text-3xl">🇰🇭</span>
              <span className="text-xl font-extrabold text-gray-800">
                KhmerLingo
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                  pathname === "/"
                    ? "bg-[#DDF4FF] text-[#1CB0F6]"
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                <BookOpen size={24} />
                <span>Learn</span>
              </Link>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                  pathname === "/profile"
                    ? "bg-[#DDF4FF] text-[#1CB0F6]"
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                <User size={24} />
                <span>Profile</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
