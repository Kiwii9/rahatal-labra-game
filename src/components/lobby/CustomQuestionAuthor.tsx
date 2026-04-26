// ============================
// CustomQuestionAuthor: Per-letter authoring panel for the host's custom question pack.
// - Each Arabic letter is a collapsible row.
// - Each row holds 1+ questions; each question has text, answer, optional category,
//   optional uploaded image, optional video URL.
// - Stores the entire map in parent state; parent persists to rooms.custom_questions.
// ============================
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ARABIC_LETTERS } from "@/lib/questionResolver";

export interface CustomQuestion {
  question: string;
  answer: string;
  category?: string;
  image_url?: string | null;
  video_url?: string | null;
}

export type CustomQuestionMap = Record<string, CustomQuestion[]>;

interface Props {
  value: CustomQuestionMap;
  onChange: (next: CustomQuestionMap) => void;
  hostUid: string | null;
  roomId: string | null;
}

const fieldStyle: React.CSSProperties = {
  backgroundColor: "hsla(195, 60%, 12%, 0.7)",
  border: "1px solid hsla(45, 60%, 55%, 0.25)",
  color: "hsl(40, 100%, 95%)",
};

const isValidQuestion = (q: CustomQuestion) =>
  q.question?.trim().length > 0 && q.answer?.trim().length > 0;

const CustomQuestionAuthor = ({ value, onChange, hostUid, roomId }: Props) => {
  const [openLetter, setOpenLetter] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const updateLetter = (letter: string, list: CustomQuestion[]) => {
    onChange({ ...value, [letter]: list });
  };

  const addQuestion = (letter: string) => {
    const list = value[letter] ? [...value[letter]] : [];
    list.push({ question: "", answer: "", category: "" });
    updateLetter(letter, list);
  };

  const removeQuestion = (letter: string, idx: number) => {
    const list = (value[letter] || []).filter((_, i) => i !== idx);
    updateLetter(letter, list);
  };

  const patch = (letter: string, idx: number, p: Partial<CustomQuestion>) => {
    const list = (value[letter] || []).map((q, i) => (i === idx ? { ...q, ...p } : q));
    updateLetter(letter, list);
  };

  const onUploadImage = async (
    letter: string,
    idx: number,
    file: File,
  ) => {
    if (!hostUid || !roomId) {
      alert("يجب أن تكون الغرفة جاهزة قبل رفع الصور");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert("حجم الصورة كبير جدًا (الحد الأقصى 3 ميجابايت)");
      return;
    }
    if (!/^image\/(png|jpeg|jpg|webp|gif)$/i.test(file.type)) {
      alert("نوع الصورة غير مدعوم");
      return;
    }
    const key = `${letter}-${idx}`;
    setUploading(key);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${hostUid}/${roomId}/${letter}-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("question-media")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("question-media").getPublicUrl(path);
      patch(letter, idx, { image_url: data.publicUrl });
    } catch (e: any) {
      console.error(e);
      alert("فشل رفع الصورة: " + (e.message || ""));
    } finally {
      setUploading(null);
    }
  };

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "hsla(192, 55%, 14%, 0.7)",
        border: "1px solid hsla(45, 60%, 55%, 0.18)",
      }}
    >
      <h4 className="text-cream/80 font-tajawal font-bold text-base mb-3 text-center">
        ✍️ أسئلتك حسب الحرف
      </h4>
      <p className="text-cream/55 text-[11px] font-tajawal text-center mb-3">
        افتح كل حرف وأضف على الأقل سؤالاً واحدًا. الصورة والفيديو اختياريان.
      </p>

      <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 gap-1.5 mb-4">
        {ARABIC_LETTERS.map((l) => {
          const list = value[l] || [];
          const filled = list.length > 0 && list.every(isValidQuestion);
          const isOpen = openLetter === l;
          return (
            <button
              key={l}
              onClick={() => setOpenLetter(isOpen ? null : l)}
              className="aspect-square rounded-lg font-tajawal font-[900] text-base transition-all"
              style={{
                background: isOpen
                  ? "linear-gradient(135deg, hsl(45, 90%, 55%), hsl(38, 88%, 42%))"
                  : filled
                  ? "hsla(140, 60%, 35%, 0.35)"
                  : "hsla(195, 60%, 12%, 0.6)",
                color: isOpen
                  ? "hsl(195, 60%, 8%)"
                  : filled
                  ? "hsl(140, 70%, 80%)"
                  : "hsl(40, 100%, 95%)",
                border: filled
                  ? "1px solid hsl(140, 60%, 50%)"
                  : "1px solid hsla(0, 0%, 100%, 0.1)",
              }}
              title={filled ? `${list.length} سؤال` : "لا يوجد سؤال"}
            >
              {l}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {openLetter && (
          <motion.div
            key={openLetter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl p-3 space-y-3"
            style={{
              background: "hsla(195, 60%, 8%, 0.55)",
              border: "1px solid hsla(45, 60%, 55%, 0.18)",
            }}
          >
            <div className="flex items-center justify-between">
              <p className="font-tajawal font-bold text-cream/80">
                حرف <span style={{ color: "hsl(45, 92%, 65%)" }}>{openLetter}</span>
              </p>
              <button
                onClick={() => addQuestion(openLetter)}
                className="px-3 py-1.5 rounded-lg font-tajawal text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, hsl(45, 90%, 55%), hsl(38, 88%, 42%))",
                  color: "hsl(195, 60%, 8%)",
                }}
              >
                + إضافة سؤال
              </button>
            </div>

            {(value[openLetter] || []).length === 0 && (
              <p className="text-cream/50 text-xs font-tajawal text-center py-2">
                لم تتم إضافة أي سؤال لهذا الحرف بعد.
              </p>
            )}

            {(value[openLetter] || []).map((q, idx) => {
              const key = `${openLetter}-${idx}`;
              return (
                <div
                  key={idx}
                  className="rounded-lg p-3 space-y-2"
                  style={{
                    background: "hsla(192, 55%, 14%, 0.7)",
                    border: "1px solid hsla(45, 60%, 55%, 0.15)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-tajawal text-xs text-cream/60">
                      سؤال #{idx + 1}
                    </span>
                    <button
                      onClick={() => removeQuestion(openLetter, idx)}
                      className="text-xs font-tajawal px-2 py-1 rounded-md"
                      style={{
                        background: "hsla(0, 70%, 40%, 0.2)",
                        color: "hsl(0, 80%, 70%)",
                        border: "1px solid hsla(0, 70%, 40%, 0.4)",
                      }}
                    >
                      حذف
                    </button>
                  </div>

                  <textarea
                    value={q.question}
                    onChange={(e) => patch(openLetter, idx, { question: e.target.value })}
                    placeholder="نص السؤال"
                    rows={2}
                    maxLength={500}
                    className="w-full rounded-lg px-3 py-2 font-tajawal text-sm focus:outline-none"
                    style={fieldStyle}
                  />
                  <input
                    value={q.answer}
                    onChange={(e) => patch(openLetter, idx, { answer: e.target.value })}
                    placeholder="الإجابة"
                    maxLength={200}
                    className="w-full rounded-lg px-3 py-2 font-tajawal text-sm focus:outline-none"
                    style={fieldStyle}
                  />
                  <input
                    value={q.category || ""}
                    onChange={(e) => patch(openLetter, idx, { category: e.target.value })}
                    placeholder="الفئة (اختياري)"
                    maxLength={30}
                    className="w-full rounded-lg px-3 py-2 font-tajawal text-sm focus:outline-none"
                    style={fieldStyle}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="font-tajawal text-[11px] text-cream/55 block mb-1">
                        🖼 صورة (اختياري)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onUploadImage(openLetter, idx, f);
                            e.target.value = "";
                          }}
                          className="text-xs text-cream/70 font-tajawal flex-1"
                        />
                        {q.image_url && (
                          <button
                            onClick={() => patch(openLetter, idx, { image_url: null })}
                            className="text-xs px-2 py-1 rounded-md font-tajawal"
                            style={{
                              background: "hsla(0, 70%, 40%, 0.2)",
                              color: "hsl(0, 80%, 70%)",
                              border: "1px solid hsla(0, 70%, 40%, 0.4)",
                            }}
                          >
                            إزالة
                          </button>
                        )}
                      </div>
                      {uploading === key && (
                        <p className="text-[10px] text-cream/50 font-tajawal mt-1">
                          جاري الرفع...
                        </p>
                      )}
                      {q.image_url && (
                        <img
                          src={q.image_url}
                          alt=""
                          className="mt-2 rounded-md max-h-20 object-contain"
                        />
                      )}
                    </div>
                    <div>
                      <label className="font-tajawal text-[11px] text-cream/55 block mb-1">
                        🎬 رابط فيديو (اختياري)
                      </label>
                      <input
                        value={q.video_url || ""}
                        onChange={(e) =>
                          patch(openLetter, idx, { video_url: e.target.value || null })
                        }
                        placeholder="https://..."
                        dir="ltr"
                        className="w-full rounded-lg px-3 py-2 font-tajawal text-xs focus:outline-none"
                        style={fieldStyle}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomQuestionAuthor;
