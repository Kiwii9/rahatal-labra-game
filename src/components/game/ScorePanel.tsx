// ============================
// ScorePanel: TV-style team score display with leather/gold aesthetic
// ============================
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface ScorePanelProps {
  teamName: string;
  score: number;
  teamColor: 'terracotta' | 'blue';
  isActive: boolean;
}

// Animated counter component
const AnimatedScore = ({ value }: { value: number }) => {
  const spring = useSpring(0, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.span className="tabular-nums">
      {useTransform(display, (v) => v.toString()).get() || value}
    </motion.span>
  );
};

const ScorePanel = ({ teamName, score, teamColor, isActive }: ScorePanelProps) => {
  const accentColor = teamColor === 'terracotta' ? '#E57A44' : '#3B82F6';
  const gradientBg = teamColor === 'terracotta'
    ? 'linear-gradient(180deg, rgba(229,122,68,0.15) 0%, rgba(3,34,47,0.9) 100%)'
    : 'linear-gradient(180deg, rgba(59,130,246,0.15) 0%, rgba(3,34,47,0.9) 100%)';

  return (
    <motion.div
      className="score-panel rounded-xl p-4 md:p-6 text-center min-w-[140px] md:min-w-[180px] relative overflow-hidden"
      style={{
        background: gradientBg,
        borderColor: accentColor,
        borderWidth: isActive ? 3 : 1,
      }}
      animate={{
        boxShadow: isActive
          ? `0 0 30px ${accentColor}40, 0 10px 30px rgba(0,0,0,0.4)`
          : '0 10px 30px rgba(0,0,0,0.3)',
      }}
      transition={{ duration: 0.5 }}
    >
      {/* Active turn indicator */}
      {isActive && (
        <motion.div
          className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
          style={{ backgroundColor: accentColor }}
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      {/* Team name */}
      <h3
        className="text-sm md:text-base font-tajawal font-bold mt-2 mb-3"
        style={{ color: accentColor }}
      >
        {teamName}
      </h3>

      {/* Score */}
      <div
        className="text-5xl md:text-7xl font-tajawal font-[900]"
        style={{
          color: '#FFF8E7',
          textShadow: `0 2px 8px ${accentColor}40, 0 4px 16px rgba(0,0,0,0.3)`,
        }}
      >
        <AnimatedScore value={score} />
      </div>

      {/* Decorative line */}
      <div
        className="mx-auto mt-3 h-0.5 w-12 rounded-full"
        style={{ backgroundColor: accentColor, opacity: 0.5 }}
      />
    </motion.div>
  );
};

export default ScorePanel;
