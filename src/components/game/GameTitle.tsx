// ============================
// GameTitle: 3D CSS text-shadow title, no random numbers
// ============================
import { motion } from "framer-motion";

interface GameTitleProps {
  hostName?: string;
  className?: string;
}

const GameTitle = ({ hostName = "رحّال", className = "" }: GameTitleProps) => {
  return (
    <motion.div
      className={`text-center select-none ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h1
        className="text-3xl md:text-5xl lg:text-6xl font-tajawal font-[900] leading-tight tracking-tight"
        style={{
          textShadow: `
            0 1px 0 hsl(20 76% 48%),
            0 2px 0 hsl(20 76% 43%),
            0 3px 0 hsl(20 76% 38%),
            0 4px 0 hsl(20 76% 33%),
            0 6px 10px rgba(0,0,0,0.4),
            0 10px 20px rgba(0,0,0,0.2)
          `,
        }}
      >
        <span style={{ color: 'hsl(var(--cream))' }}>خلية </span>
        <span style={{ color: 'hsl(var(--golden))' }}>الحروف</span>
      </h1>
      <div
        className="text-xl md:text-2xl lg:text-3xl mt-1 font-tajawal font-bold"
        style={{
          textShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        <span style={{ color: 'hsl(var(--accent))' }}>مع </span>
        <span style={{ color: 'hsl(var(--primary))' }}>{hostName}</span>
      </div>
    </motion.div>
  );
};

export default GameTitle;
