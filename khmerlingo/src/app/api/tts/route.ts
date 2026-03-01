import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";
const MODEL_ID = "eleven_multilingual_v2";

// In-memory cache: text → Blob  (resets on server restart)
const audioCache = new Map<string, Blob>();

const audioHeaders = {
  "Content-Type": "audio/mpeg",
  "Cache-Control": "public, max-age=86400",
};

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const cacheKey = text.trim().toLowerCase();

  // Return cached audio if available
  const cached = audioCache.get(cacheKey);
  if (cached) {
    return new Response(cached, { headers: audioHeaders });
  }

  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY not configured" },
      { status: 503 }
    );
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

    // Cache (limit to 200 entries)
    if (audioCache.size >= 200) {
      const oldestKey = audioCache.keys().next().value;
      if (oldestKey) audioCache.delete(oldestKey);
    }
    audioCache.set(cacheKey, blob);

    return new Response(blob, { headers: audioHeaders });
  } catch (err) {
    console.error("TTS route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
