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

export function resolveQuestion(letter: string, room: any): ResolvedQuestion {
  const source: string = room?.question_source || "builtin";
  if (source === "custom") {
    const map = (room?.custom_questions || {}) as Record<string, CustomQ[]>;
    const list = map[letter];
    if (Array.isArray(list) && list.length > 0) {
      const q = list[Math.floor(Math.random() * list.length)];
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
