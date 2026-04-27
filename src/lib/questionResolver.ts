// ============================
// questionResolver: Pick a question for a letter from either the host's
// custom set (stored on rooms.custom_questions) or the bundled bank.
// ============================
import { getQuestionForLetter } from "@/lib/gameLogic";

export interface ResolvedQuestion {
  question: string;
  answer: string;
  category: string;
  imageUrl?: string;
  videoUrl?: string;
}

interface CustomQ {
  question: string;
  answer: string;
  category?: string;
  image_url?: string | null;
  video_url?: string | null;
}

// Pick a question for a letter. If `idx` is provided, use that exact index
// from the host's custom set — this keeps host, players, and TV in sync.
// If `idx` is omitted, a random one is chosen (host-side use only).
export function resolveQuestion(letter: string, room: any, idx?: number | null): ResolvedQuestion {
  const source: string = room?.question_source || "builtin";
  if (source === "custom") {
    const map = (room?.custom_questions || {}) as Record<string, CustomQ[]>;
    const list = map[letter];
    if (Array.isArray(list) && list.length > 0) {
      const safeIdx = (typeof idx === 'number' && idx >= 0 && idx < list.length)
        ? idx
        : Math.floor(Math.random() * list.length);
      const q = list[safeIdx];
      return {
        question: q.question,
        answer: q.answer,
        category: q.category || "سؤال مخصص",
        imageUrl: q.image_url || undefined,
        videoUrl: q.video_url || undefined,
      };
    }
    // Fallback if a letter has no custom question
  }
  const q = getQuestionForLetter(letter);
  return { question: q.question, answer: q.answer, category: q.category };
}

// Pick a fresh random index for a letter's custom question list.
// Returns null if the letter has no custom questions (resolveQuestion will
// then fall back to the builtin bank).
export function pickCustomIndex(letter: string, room: any): number | null {
  if ((room?.question_source || 'builtin') !== 'custom') return null;
  const list = (room?.custom_questions || {})[letter];
  if (!Array.isArray(list) || list.length === 0) return null;
  return Math.floor(Math.random() * list.length);
}

// 28-letter Arabic alphabet (game uses the same set as gameLogic)
export const ARABIC_LETTERS = [
  "أ","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ",
  "ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي",
];

export function customCoverage(custom: Record<string, CustomQ[]> | null | undefined): {
  filled: number;
  total: number;
  missing: string[];
} {
  const map = custom || {};
  const missing: string[] = [];
  let filled = 0;
  for (const l of ARABIC_LETTERS) {
    const list = map[l];
    if (Array.isArray(list) && list.length > 0 && list.every(q => q.question?.trim() && q.answer?.trim())) {
      filled++;
    } else {
      missing.push(l);
    }
  }
  return { filled, total: ARABIC_LETTERS.length, missing };
}
