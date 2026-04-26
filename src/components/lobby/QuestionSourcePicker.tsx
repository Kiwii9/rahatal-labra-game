// ============================
// QuestionSourcePicker: Two-card chooser between built-in bank and custom authoring.
// ============================
import { motion } from "framer-motion";

export type QuestionSource = "builtin" | "custom";

interface Props {
  value: QuestionSource;
  onChange: (v: QuestionSource) => void;
  customCount: number; // number of letters with at least one valid question
  totalLetters: number;
}

const QuestionSourcePicker = ({ value, onChange, customCount, totalLetters }: Props) => {
  const goldGlow = "0 0 0 2px hsl(45, 90%, 55%), 0 0 20px hsla(45, 90%, 55%, 0.5)";

  const Card = ({
    active, title, subtitle, emoji, onClick, badge,
  }: {
    active: boolean;
    title: string;
    subtitle: string;
    emoji: string;
    onClick: () => void;
    badge?: string;
  }) => (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-2xl p-4 text-center transition-all"
      style={{
        background: active
          ? "linear-gradient(180deg, hsla(45, 90%, 55%, 0.18) 0%, hsla(192, 55%, 14%, 0.9) 100%)"
          : "hsla(192, 55%, 18%, 0.5)",
        border: active ? "2px solid hsl(45, 90%, 55%)" : "1px solid hsla(0, 0%, 100%, 0.08)",
        boxShadow: active ? goldGlow : "none",
      }}
    >
      <div className="text-3xl mb-1">{emoji}</div>
      <p
        className="font-tajawal font-[900] text-base md:text-lg"
        style={{ color: active ? "hsl(45, 92%, 65%)" : "hsl(40, 100%, 95%)" }}
      >
        {title}
      </p>
      <p className="text-cream/55 text-[11px] font-tajawal mt-1">{subtitle}</p>
      {badge && (
        <p
          className="mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-tajawal"
          style={{
            background: "hsla(45, 90%, 55%, 0.15)",
            color: "hsl(45, 92%, 65%)",
            border: "1px solid hsla(45, 90%, 55%, 0.4)",
          }}
        >
          {badge}
        </p>
      )}
    </motion.button>
  );

  return (
    <div>
      <h3 className="text-cream/80 font-tajawal font-bold text-lg mb-3 text-center">
        مصدر الأسئلة
      </h3>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <Card
          active={value === "builtin"}
          title="أسئلة جاهزة"
          subtitle="بنك أسئلة عربي مدمج"
          emoji="📚"
          onClick={() => onChange("builtin")}
        />
        <Card
          active={value === "custom"}
          title="أسئلتي الخاصة"
          subtitle="اكتب أسئلتك بنفسك مع صور / فيديو"
          emoji="✍️"
          onClick={() => onChange("custom")}
          badge={value === "custom" ? `${customCount}/${totalLetters} حرف` : undefined}
        />
      </div>
    </div>
  );
};

export default QuestionSourcePicker;
