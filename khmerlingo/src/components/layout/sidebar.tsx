"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/store/game-store";
import { formatXP } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors",
        active
          ? "bg-[#DDF4FF] text-[#1CB0F6]"
          : "text-gray-500 hover:bg-gray-100"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { xp, streak, hearts, gems } = useGameStore();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r-2 border-gray-200 bg-white md:flex md:flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b-2 border-gray-200 px-6 py-5">
        <span className="text-3xl" role="img" aria-label="Cambodia flag">
          🇰🇭
        </span>
        <span className="text-xl font-extrabold text-gray-800">KhmerLingo</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-4">
        <NavItem
          href="/"
          icon={<BookOpen size={24} />}
          label="Learn"
          active={pathname === "/"}
        />
        <NavItem
          href="/profile"
          icon={<User size={24} />}
          label="Profile"
          active={pathname === "/profile"}
        />
      </nav>

      {/* User Stats */}
      <div className="border-t-2 border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-yellow-50 px-3 py-2">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-bold text-[#FAA918]">
              {formatXP(xp)} XP
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-2">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-bold text-orange-500">
              {streak}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2">
            <span className="text-lg">❤️</span>
            <span className="text-sm font-bold text-[#E53838]">
              {hearts}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2">
            <span className="text-lg">💎</span>
            <span className="text-sm font-bold text-[#1CB0F6]">
              {gems}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
