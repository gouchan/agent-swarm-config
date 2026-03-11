import { translate } from "@vitalets/google-translate-api";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getIP } from "@/lib/rate-limit";

const ALLOWED_LANGS = ["en", "km"];

export async function POST(req: NextRequest) {
  // Rate limit: 60 translate requests per minute per IP
  if (!rateLimit(getIP(req), 60, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { text, from, to } = await req.json() as {
      text: string;
      from: string;
      to: string;
    };

    if (!text || !from || !to) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (!ALLOWED_LANGS.includes(from) || !ALLOWED_LANGS.includes(to)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    if (text.length > 500) {
      return NextResponse.json({ error: "Text too long (max 500 chars)" }, { status: 400 });
    }

    const result = await translate(text, { from, to });

    return NextResponse.json({ translation: result.text });
  } catch {
    return NextResponse.json(
      { error: "Translation unavailable — check connection" },
      { status: 503 }
    );
  }
}
