"use client";

import { useState, useRef, useEffect } from "react";
import { useProfileStore, Profile } from "@/store/profile-store";
import { cn } from "@/lib/utils";

// 24 emoji avatars in 3 categories
const AVATAR_OPTIONS = [
  // People
  "🧑", "👩", "👨", "🧒", "👧", "🧓", "👴", "👵",
  // Animals
  "🐶", "🐱", "🐭", "🦊", "🐻", "🐼", "🐸", "🦁",
  // Fun / Objects
  "🌟", "🎮", "📚", "🏆", "🎯", "🦋", "🌺", "🎭",
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

  function handleSelect(emoji: string) {
    updateProfileAvatar(profileId, emoji);
    onClose();
  }

  return (
    <div
      ref={ref}
      className="absolute z-50 top-full mt-1 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-2"
      style={{ width: 156 }}
    >
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 text-center mb-1.5">
        Choose Avatar
      </p>
      <div className="grid grid-cols-6 gap-0.5">
        {AVATAR_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleSelect(emoji)}
            className={cn(
              "flex items-center justify-center h-6 w-6 rounded-md text-sm transition-all hover:scale-110 active:scale-95",
              emoji === currentAvatar ? "bg-gray-100 ring-2" : "hover:bg-gray-50"
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

      {/* Name (editable on double-click) */}
      {editing ? (
        <input
          ref={inputRef}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="w-14 rounded border border-gray-300 px-1 py-0.5 text-center text-xs font-bold outline-none focus:border-blue-400"
          maxLength={12}
        />
      ) : (
        <span
          className="max-w-[56px] truncate text-center text-xs font-bold text-gray-700"
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleDoubleClick();
          }}
          title="Double-click to rename"
        >
          {profile.name}
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
        Click avatar to change • Double-click name to rename
      </p>
    </div>
  );
}
