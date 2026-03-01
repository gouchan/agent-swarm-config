"use client";

// Audio cache: text → object URL
const urlCache = new Map<string, string>();

// Single <audio> element reused throughout
let audioEl: HTMLAudioElement | null = null;

function getAudioEl(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = "auto";
  }
  return audioEl;
}

/**
 * Play a word/phrase via ElevenLabs TTS.
 * Falls back to Web Speech API (km-KH locale) if ElevenLabs fails.
 */
export async function speakText(text: string): Promise<void> {
  if (typeof window === "undefined") return;

  // Try cached URL
  if (urlCache.has(text)) {
    playUrl(urlCache.get(text)!);
    return;
  }

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) throw new Error(`TTS ${res.status}`);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    urlCache.set(text, url);
    playUrl(url);
  } catch (err) {
    console.warn("ElevenLabs TTS failed, falling back to Web Speech:", err);
    speakWebSpeech(text);
  }
}

/**
 * Speak Khmer script using the browser's Web Speech API (km-KH locale).
 * Works natively in Chrome on desktop with Google Khmer voice.
 */
export function speakKhmer(khmerText: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(khmerText);

  // Try to find a Khmer voice
  const voices = window.speechSynthesis.getVoices();
  const khmerVoice =
    voices.find((v) => v.lang === "km-KH") ||
    voices.find((v) => v.lang.startsWith("km"));

  if (khmerVoice) {
    utt.voice = khmerVoice;
    utt.lang = khmerVoice.lang;
  } else {
    utt.lang = "km-KH";
  }

  utt.rate = 0.85;
  utt.pitch = 1;
  window.speechSynthesis.speak(utt);
}

function speakWebSpeech(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-US";
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
}

function playUrl(url: string): void {
  const el = getAudioEl();
  el.src = url;
  el.currentTime = 0;
  el.play().catch((e) => console.warn("Audio play error:", e));
}

// Sound effects
let correctAudio: HTMLAudioElement | null = null;
let wrongAudio: HTMLAudioElement | null = null;

export function playCorrectSound(): void {
  if (typeof window === "undefined") return;
  if (!correctAudio) {
    correctAudio = new Audio();
    // Generate a quick cheerful tone via Web Audio
    playTone(880, 0.12, "sine", 0.25);
    return;
  }
  playTone(880, 0.12, "sine", 0.25);
}

export function playWrongSound(): void {
  if (typeof window === "undefined") return;
  playTone(220, 0.18, "sawtooth", 0.2);
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType,
  volume: number
): void {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

// Preload audio for a set of texts (call on module load)
export async function preloadAudio(texts: string[]): Promise<void> {
  const batch = texts.filter((t) => !urlCache.has(t)).slice(0, 8);
  await Promise.allSettled(
    batch.map(async (text) => {
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (res.ok) {
          const blob = await res.blob();
          urlCache.set(text, URL.createObjectURL(blob));
        }
      } catch {
        // ignore preload errors
      }
    })
  );
}
