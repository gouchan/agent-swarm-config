import { NextRequest, NextResponse } from "next/server";

/**
 * Grades a conversational challenge response using fuzzy matching.
 * No external AI dependency required — uses Levenshtein distance + normalization.
 */

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width chars
    .replace(/[.,!?;:'"()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Levenshtein distance */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** Similarity ratio 0-1 */
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

interface GradeRequest {
  userAnswer: string;
  correctAnswer: string;
  acceptedAnswers?: string[]; // alternative correct answers
}

interface GradeResponse {
  correct: boolean;
  score: number; // 0-100
  feedback: string;
  suggestion?: string; // closest correct answer if wrong
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GradeRequest;
    const { userAnswer, correctAnswer, acceptedAnswers = [] } = body;

    if (!userAnswer || !correctAnswer) {
      return NextResponse.json({ error: "Missing userAnswer or correctAnswer" }, { status: 400 });
    }

    const normalizedUser = normalize(userAnswer);
    const allAccepted = [correctAnswer, ...acceptedAnswers];

    let bestScore = 0;
    let bestMatch = correctAnswer;

    for (const accepted of allAccepted) {
      const normalizedAccepted = normalize(accepted);
      const score = similarity(normalizedUser, normalizedAccepted);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = accepted;
      }
    }

    const scorePercent = Math.round(bestScore * 100);
    const isCorrect = scorePercent >= 80; // 80% similarity threshold
    const isClose = scorePercent >= 60;

    let feedback: string;
    if (scorePercent === 100) {
      feedback = "Perfect! Exactly right!";
    } else if (scorePercent >= 90) {
      feedback = "Excellent! Almost perfect!";
    } else if (isCorrect) {
      feedback = "Good job! Close enough!";
    } else if (isClose) {
      feedback = "Almost there! Check your spelling.";
    } else {
      feedback = "Not quite right. Try again!";
    }

    const result: GradeResponse = {
      correct: isCorrect,
      score: scorePercent,
      feedback,
      suggestion: !isCorrect ? bestMatch : undefined,
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Grading failed" }, { status: 500 });
  }
}
