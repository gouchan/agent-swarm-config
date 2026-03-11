"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil } from "lucide-react";
import { useProfileStore, Profile } from "@/store/profile-store";
import { cn } from "@/lib/utils";

// ── Rich categorized emoji avatars ──────────────────────────────────────────
const AVATAR_CATEGORIES = [
  {
    label: "😊",
    title: "Smileys",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "🥹", "😅", "🤣",
      "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😎",
      "🤩", "🥳", "😏", "🤗", "🤔", "🫡", "🤭", "😶‍🌫️",
    ],
  },
  {
    label: "🧑",
    title: "People",
    emojis: [
      "🧑", "👩", "👨", "🧒", "👧", "👦", "🧒", "🧓",
      "👴", "👵", "🧑‍🎓", "🧑‍🎤", "🧑‍🍳", "🧑‍🚀", "🧑‍🎨", "🦸",
      "🧙", "🧚", "🧛", "🧜", "🧝", "🧞", "🥷", "🧑‍🏫",
    ],
  },
  {
    label: "🐾",
    title: "Animals",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
      "🐸", "🦁", "🐯", "🐮", "🐷", "🐵", "🦄", "🐝",
      "🦋", "🐙", "🐬", "🦈", "🐧", "🦉", "🦜", "🐲",
    ],
  },
  {
    label: "🍕",
    title: "Food",
    emojis: [
      "🍕", "🍔", "🍟", "🌮", "🍣", "🍜", "🍩", "🧁",
      "🍰", "🍦", "🍓", "🍉", "🥑", "🍋", "🥭", "🍇",
      "🫐", "🥥", "🍪", "🧋", "☕", "🍵", "🧃", "🍱",
    ],
  },
  {
    label: "⚽",
    title: "Sports",
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🥊",
      "🏄", "🚴", "🏊", "🤸", "⛷️", "🏋️", "🎯", "🎳",
      "🏆", "🥇", "🎖️", "🏅", "🎪", "🎸", "🎮", "🎲",
    ],
  },
  {
    label: "🌿",
    title: "Nature",
    emojis: [
      "🌸", "🌺", "🌻", "🌹", "🌷", "🌿", "🍀", "🌴",
      "🌈", "⭐", "🌙", "☀️", "🔥", "💧", "❄️", "🌊",
      "🌍", "🏔️", "🏝️", "🌵", "🍄", "🦀", "🐚", "🪸",
    ],
  },
  {
    label: "🇰🇭",
    title: "Cambodia",
    emojis: [
      "🇰🇭", "🏛️", "🛕", "🪷", "🐘", "🌾", "🥥", "🍌",
      "🎋", "🪭", "🪘", "🛶", "🧘", "🪬", "📿", "🎑",
      "🏮", "🪻", "🦚", "🐍", "🐊", "🌅", "⛩️", "🧧",
    ],
  },
  {
    label: "✨",
    title: "Fun",
    emojis: [
      "✨", "💫", "🌟", "⚡", "💥", "🎉", "🎊", "🎈",
      "💎", "👑", "🎭", "🎪", "🚀", "🛸", "🌈", "🦄",
      "👻", "🤖", "👽", "💀", "🎃", "🧿", "💝", "🫧",
    ],
  },
];

function AvatarPicker({
  profileId,
  currentAvatar,
  profileColor,
  onClose,
}: {
  profileId: string;
  currentAvatar: string;
  profileColor: string;
  onClose: () => void;
}) {
  const { updateProfileAvatar } = useProfileStore();
  const [activeCategory, setActiveCategory] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSelect(emoji: string) {
    updateProfileAvatar(profileId, emoji);
    onClose();
  }

  const category = AVATAR_CATEGORIES[activeCategory];

  return (
    <div
      ref={ref}
      className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden"
      style={{ width: 260 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-1.5">
        <p className="text-xs font-extrabold text-gray-700 text-center">
          Pick Your Avatar
        </p>
        <p className="text-[9px] text-gray-400 text-center mt-0.5">
          Express yourself!
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-0.5 px-2 pb-1.5 overflow-x-auto scrollbar-hide">
        {AVATAR_CATEGORIES.map((cat, i) => (
          <button
            key={cat.title}
            onClick={() => setActiveCategory(i)}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1 transition-all flex-shrink-0 min-w-[30px]",
              i === activeCategory
                ? "bg-gray-100"
                : "hover:bg-gray-50"
            )}
            style={
              i === activeCategory
                ? { boxShadow: `0 2px 0 0 ${profileColor}` }
                : undefined
            }
            title={cat.title}
          >
            <span className="text-sm leading-none">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Category title */}
      <div className="px-3 py-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {category.title}
        </p>
      </div>

      {/* Emoji grid */}
      <div className="px-2 pb-2 max-h-[160px] overflow-y-auto">
        <div className="grid grid-cols-8 gap-0.5">
          {category.emojis.map((emoji, idx) => (
            <button
              key={`${emoji}-${idx}`}
              onClick={() => handleSelect(emoji)}
              className={cn(
                "flex items-center justify-center h-7 w-7 rounded-lg text-base transition-all hover:scale-125 active:scale-95 hover:bg-gray-100",
                emoji === currentAvatar && "bg-gray-100 ring-2 ring-offset-1"
              )}
              style={
                emoji === currentAvatar
                  ? { boxShadow: `0 0 0 2px ${profileColor}` }
                  : undefined
              }
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="border-t border-gray-100 px-3 py-1.5 bg-gray-50/50">
        <p className="text-[9px] text-gray-400 text-center">
          Current: {currentAvatar} • Press Esc to close
        </p>
      </div>
    </div>
  );
}

function ProfileCard({
  profile,
  isActive,
  onSelect,
  onRename,
}: {
  profile: Profile;
  isActive: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDoubleClick() {
    setDraftName(profile.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitRename() {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== profile.name) {
      onRename(trimmed);
    } else {
      setDraftName(profile.name);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") {
      setDraftName(profile.name);
      setEditing(false);
    }
  }

  function handleAvatarClick(e: React.MouseEvent) {
    e.stopPropagation();
    setShowAvatarPicker((v) => !v);
  }

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-center gap-1 rounded-xl p-2 transition-all cursor-pointer border-2",
        isActive ? "border-transparent bg-gray-50" : "border-transparent hover:bg-gray-50"
      )}
      style={isActive ? { boxShadow: `0 0 0 3px ${profile.color}` } : undefined}
    >
      {/* Avatar — click to open picker */}
      <span
        className="text-2xl leading-none cursor-pointer hover:scale-110 transition-transform select-none"
        onClick={handleAvatarClick}
        title="Click to change avatar"
      >
        {profile.avatar}
      </span>

      {/* Avatar picker popover */}
      {showAvatarPicker && (
        <AvatarPicker
          profileId={profile.id}
          currentAvatar={profile.avatar}
          profileColor={profile.color}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}

      {/* Name (editable) */}
      {editing ? (
        <input
          ref={inputRef}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          placeholder="Your name…"
          className="w-16 rounded-lg border-2 border-blue-400 bg-blue-50 px-1 py-0.5 text-center text-xs font-bold outline-none placeholder:text-gray-400"
          maxLength={12}
        />
      ) : (
        <span
          className="group/name flex items-center gap-0.5"
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleDoubleClick();
          }}
        >
          <span
            className={cn(
              "max-w-[44px] truncate text-xs font-bold",
              isActive ? "text-gray-800" : "text-gray-600"
            )}
          >
            {profile.name}
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              handleDoubleClick();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                handleDoubleClick();
              }
            }}
            className="opacity-0 group-hover/name:opacity-100 transition-opacity cursor-pointer"
            title="Rename"
          >
            <Pencil className="h-2.5 w-2.5 text-gray-400 hover:text-[#1CB0F6]" />
          </span>
        </span>
      )}

      {/* Active dot */}
      {isActive && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: profile.color }}
        />
      )}
    </button>
  );
}

export function ProfileSwitcher() {
  const { profiles, activeProfileId, setActiveProfile, updateProfileName } =
    useProfileStore();

  return (
    <div className="border-b-2 border-gray-200 px-2 py-3">
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Profiles
      </p>
      <div className="grid grid-cols-4 gap-1">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isActive={profile.id === activeProfileId}
            onSelect={() => setActiveProfile(profile.id)}
            onRename={(name) => updateProfileName(profile.id, name)}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[9px] text-gray-400 text-center">
        Tap avatar to change emoji • Hover name to rename ✏️
      </p>
    </div>
  );
}
