import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getIP } from "@/lib/rate-limit";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";
const MODEL_ID = "eleven_multilingual_v2";

// In-memory cache: text → Blob  (resets on server restart)
const audioCache = new Map<string, Blob>();
let cacheSizeBytes = 0;
const MAX_CACHE_BYTES = 50 * 1024 * 1024; // 50 MB ceiling
const MAX_TEXT_LENGTH = 500;

const audioHeaders = {
  "Content-Type": "audio/mpeg",
  "Cache-Control": "public, max-age=86400",
};

export async function POST(req: NextRequest) {
  // Rate limit: 30 TTS requests per minute per IP
  if (!rateLimit(getIP(req), 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { text } = await req.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Text too long (max ${MAX_TEXT_LENGTH} chars)` },
      { status: 400 }
    );
  }

  const cacheKey = text.trim().toLowerCase();

  // Return cached audio if available
  const cached = audioCache.get(cacheKey);
  if (cached) {
    return new Response(cached, { headers: audioHeaders });
  }

  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: "TTS service unavailable" }, { status: 503 });
  }

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.75,
            style: 0.1,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error("ElevenLabs error:", upstream.status, errText);
      return NextResponse.json(
        { error: "TTS service error" },
        { status: upstream.status }
      );
    }

    const blob = await upstream.blob();

    // Byte-based cache eviction — evict oldest until under the limit
    while (cacheSizeBytes + blob.size > MAX_CACHE_BYTES && audioCache.size > 0) {
      const oldestKey = audioCache.keys().next().value;
      if (oldestKey) {
        cacheSizeBytes -= audioCache.get(oldestKey)!.size;
        audioCache.delete(oldestKey);
      }
    }
    audioCache.set(cacheKey, blob);
    cacheSizeBytes += blob.size;

    return new Response(blob, { headers: audioHeaders });
  } catch (err) {
    console.error("TTS route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
