import { translate } from "@vitalets/google-translate-api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, from, to } = await req.json() as {
      text: string;
      from: "en" | "km";
      to: "en" | "km";
    };

    if (!text || !from || !to) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
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
