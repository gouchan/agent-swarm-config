/**
 * Khmer NLP Utilities
 * Provides basic natural language processing for Khmer script.
 */

// Unicode ranges for Khmer script: U+1780–U+17FF
const KHMER_CONSONANTS: Record<string, string> = {
  "ក": "k",
  "ខ": "kh",
  "គ": "g",
  "ឃ": "gh",
  "ង": "ng",
  "ច": "ch",
  "ឆ": "chh",
  "ជ": "j",
  "ឈ": "jh",
  "ញ": "ny",
  "ដ": "d",
  "ឋ": "th",
  "ឌ": "d",
  "ឍ": "dh",
  "ណ": "n",
  "ត": "t",
  "ថ": "th",
  "ទ": "t",
  "ធ": "th",
  "ន": "n",
  "ប": "b",
  "ផ": "ph",
  "ព": "p",
  "ភ": "bh",
  "ម": "m",
  "យ": "y",
  "រ": "r",
  "ល": "l",
  "វ": "v",
  "ស": "s",
  "ហ": "h",
  "ឡ": "l",
  "អ": "a",
};

const KHMER_VOWELS: Record<string, string> = {
  "ា": "a",
  "ិ": "e",
  "ី": "i",
  "ឹ": "eu",
  "ឺ": "eu",
  "ុ": "o",
  "ូ": "u",
  "ួ": "ua",
  "ើ": "ae",
  "ឿ": "ea",
  "ៀ": "ie",
  "េ": "e",
  "ែ": "ae",
  "ៃ": "ai",
  "ោ": "ao",
  "ៅ": "ow",
  "ំ": "om",
  "ះ": "ah",
  "ៈ": "a",
};

// Common Khmer syllable romanizations
const SYLLABLE_MAP: Record<string, string> = {
  "សួស្ដី": "suostei",
  "អរគុណ": "orkun",
  "បាទ": "bat",
  "ចាស": "chas",
  "ទេ": "te",
  "អ្នក": "neak",
  "ខ្ញុំ": "khnyom",
  "មិន": "min",
  "មាន": "mean",
  "ចង់": "jong",
  "ទៅ": "tov",
  "មក": "mok",
  "ញ៉ាំ": "nyam",
  "ហូប": "hop",
  "ទឹក": "teuk",
  "ម្ហូប": "mhob",
  "ផ្ទះ": "pteah",
  "ផ្លូវ": "plov",
  "ឆ្ងាញ់": "chhngany",
  "ថ្ងៃ": "thngai",
  "ថ្ងៃនេះ": "thngai nih",
  "ព្រឹក": "proek",
  "ល្ងាច": "lngeach",
  "យប់": "yob",
  "ពេល": "peel",
  "ម៉ោង": "maong",
  "ឆ្នាំ": "chnam",
  "ខែ": "khae",
  "ស្រី": "srei",
  "ប្រុស": "bros",
  "កុមារ": "komal",
  "ឪពុក": "ovpuk",
  "ម្ដាយ": "mdai",
  "ប្អូន": "paon",
  "បងប្រុស": "bong bros",
  "បងស្រី": "bong srei",
  "ក្រុមគ្រួសារ": "krom krousar",
  "ស្ទ": "ste",
  "ល": "l",
  "ភ្នំ": "phnom",
  "ភ្នំពេញ": "phnom penh",
  "ប្រទេស": "prateh",
  "ខ្មែរ": "khmer",
  "ភាសា": "phiesa",
};

/**
 * Normalize Khmer Unicode text.
 * Applies NFC normalization and trims whitespace.
 */
export function normalizeKhmer(text: string): string {
  return text.normalize("NFC").trim();
}

/**
 * Basic romanization of Khmer text.
 * Checks the syllable map first, then falls back to character-level transliteration.
 */
export function romanizeKhmer(khmer: string): string {
  const normalized = normalizeKhmer(khmer);

  // Check full-phrase match first
  if (SYLLABLE_MAP[normalized]) {
    return SYLLABLE_MAP[normalized];
  }

  // Try to match substrings
  let result = normalized;
  for (const [khmerSyllable, roman] of Object.entries(SYLLABLE_MAP)) {
    result = result.split(khmerSyllable).join(roman);
  }

  // Character-level fallback
  let charResult = "";
  for (const char of result) {
    if (KHMER_CONSONANTS[char]) {
      charResult += KHMER_CONSONANTS[char];
    } else if (KHMER_VOWELS[char]) {
      charResult += KHMER_VOWELS[char];
    } else {
      charResult += char;
    }
  }

  return charResult;
}

/**
 * Validate a user's answer against the correct answer.
 * Case-insensitive, trims whitespace, normalizes Unicode.
 */
export function validateAnswer(userInput: string, correct: string): boolean {
  const normalize = (s: string) =>
    s.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
  return normalize(userInput) === normalize(correct);
}

/**
 * Basic Khmer tokenizer.
 * Khmer script does not use spaces between words. This tokenizer uses
 * a heuristic approach: split on spaces (where present), and attempt
 * to identify word boundaries using known syllable patterns.
 */
export function tokenizeKhmer(text: string): string[] {
  const normalized = normalizeKhmer(text);

  // If the text contains spaces, split on them first
  if (normalized.includes(" ")) {
    return normalized.split(/\s+/).filter((t) => t.length > 0);
  }

  // Attempt syllable-boundary detection for spaceless Khmer text.
  // A syllable typically: consonant + (subscript) + vowel + (final consonant)
  // U+17D2 (​​​KHMER SIGN COENG) indicates a subscript/stacked consonant
  const tokens: string[] = [];
  let current = "";

  const chars = Array.from(normalized); // Handle multi-codepoint chars
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const codePoint = char.codePointAt(0) ?? 0;

    // Khmer range: 0x1780-0x17FF
    const isKhmer = codePoint >= 0x1780 && codePoint <= 0x17ff;

    if (!isKhmer) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      tokens.push(char);
      continue;
    }

    const isConsonant = codePoint >= 0x1780 && codePoint <= 0x17a2;
    const isCoeng = codePoint === 0x17d2; // Subscript marker

    // Start a new syllable when we hit a consonant that is NOT preceded by COENG
    if (
      isConsonant &&
      current.length > 0 &&
      !current.endsWith("\u17D2") // previous char is not COENG
    ) {
      // Check that current syllable has a vowel or is complete enough
      const hasVowel = Array.from(current).some((c) => {
        const cp = c.codePointAt(0) ?? 0;
        return cp >= 0x17b6 && cp <= 0x17d1;
      });
      if (hasVowel) {
        tokens.push(current);
        current = "";
      }
    }

    current += char;
    void isCoeng; // suppress unused warning
  }

  if (current) tokens.push(current);

  return tokens.filter((t) => t.length > 0);
}

export type KhmerCharType = "consonant" | "vowel" | "other";

export interface KhmerCharInfo {
  name: string;
  type: KhmerCharType;
}

const CONSONANT_NAMES: Record<string, string> = {
  "ក": "Ka",
  "ខ": "Kha",
  "គ": "Ko",
  "ឃ": "Kho",
  "ង": "Ngo",
  "ច": "Cha",
  "ឆ": "Chha",
  "ជ": "Cho",
  "ឈ": "Chho",
  "ញ": "Nyo",
  "ដ": "Da",
  "ឋ": "Ttha",
  "ឌ": "Do",
  "ឍ": "Ddho",
  "ណ": "Na",
  "ត": "Ta",
  "ថ": "Tha",
  "ទ": "To",
  "ធ": "Tho",
  "ន": "No",
  "ប": "Ba",
  "ផ": "Pha",
  "ព": "Po",
  "ភ": "Pho",
  "ម": "Mo",
  "យ": "Yo",
  "រ": "Ro",
  "ល": "Lo",
  "វ": "Vo",
  "ស": "Sa",
  "ហ": "Ha",
  "ឡ": "La",
  "អ": "Ah",
};

const VOWEL_NAMES: Record<string, string> = {
  "ា": "Aa",
  "ិ": "E short",
  "ី": "I long",
  "ឹ": "Eu short",
  "ឺ": "Eu long",
  "ុ": "O short",
  "ូ": "U long",
  "ួ": "Ua",
  "ើ": "Ae",
  "ឿ": "Ea",
  "ៀ": "Ie",
  "េ": "E",
  "ែ": "Ae open",
  "ៃ": "Ai",
  "ោ": "Ao",
  "ៅ": "Ow",
  "ំ": "Am/Om",
  "ះ": "Ah final",
  "ៈ": "A short final",
};

/**
 * Get information about a single Khmer character.
 */
export function getKhmerCharInfo(char: string): KhmerCharInfo {
  if (CONSONANT_NAMES[char]) {
    return { name: CONSONANT_NAMES[char], type: "consonant" };
  }
  if (VOWEL_NAMES[char]) {
    return { name: VOWEL_NAMES[char], type: "vowel" };
  }

  const cp = char.codePointAt(0) ?? 0;
  if (cp >= 0x1780 && cp <= 0x17ff) {
    return { name: `Khmer U+${cp.toString(16).toUpperCase()}`, type: "other" };
  }

  return { name: char, type: "other" };
}
