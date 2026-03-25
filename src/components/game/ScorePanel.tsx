// ============================
// ScorePanel: Clean score display with glow active state (no floating artifacts)
// ============================
import { motion } from "framer-motion";

interface ScorePanelProps {
  teamName: string;
  score: number;
  teamColor: 'terracotta' | 'blue';
  isActive: boolean;
}

const TEAM_COLORS = {
  terracotta: 'hsl(20 76% 58%)',
  blue: 'hsl(217 92% 60%)',
} as const;

const ScorePanel = ({ teamName, score, teamColor, isActive }: ScorePanelProps) => {
  const color = TEAM_COLORS[teamColor];

  return (
    <motion.div
      className="rounded-xl p-4 md:p-6 text-center min-w-[140px] md:min-w-[180px] relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${color}22 0%, hsl(197 88% 10% / 0.9) 100%)`,
        border: `${isActive ? 3 : 1}px solid ${color}`,
      }}
      animate={{
        scale: isActive ? 1.05 : 1,
        boxShadow: isActive
          ? `0 0 40px ${color}50, 0 0 80px ${color}20, 0 10px 30px rgba(0,0,0,0.4)`
          : `0 10px 30px rgba(0,0,0,0.3)`,
      }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
    >
      {/* Team name */}
      <h3
        className="text-sm md:text-base font-tajawal font-bold mb-3"
        style={{ color }}
      >
        {teamName}
      </h3>

      {/* Score */}
      <div
        className="text-5xl md:text-7xl font-tajawal font-[900] tabular-nums"
        style={{
          color: 'hsl(var(--cream))',
          textShadow: `0 2px 8px ${color}40, 0 4px 16px rgba(0,0,0,0.3)`,
        }}
      >
        {score}
      </div>

      {/* Decorative line */}
      <div
        className="mx-auto mt-3 h-0.5 w-12 rounded-full"
        style={{ backgroundColor: color, opacity: 0.5 }}
      />
    </motion.div>
  );
};

export default ScorePanel;
