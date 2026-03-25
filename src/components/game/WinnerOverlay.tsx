// ============================
// WinnerOverlay: Dramatic winning screen with path animation
// ============================
import { motion } from "framer-motion";

interface WinnerOverlayProps {
  winnerName: string;
  winnerColor: 'terracotta' | 'blue';
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

const WinnerOverlay = ({ winnerName, winnerColor, onPlayAgain, onMainMenu }: WinnerOverlayProps) => {
  const color = winnerColor === 'terracotta' ? '#E57A44' : '#3B82F6';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(3,34,47,0.95)', backdropFilter: 'blur(12px)' }} />

      <motion.div
        className="relative text-center z-10"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.3 }}
      >
        {/* Trophy */}
        <motion.div
          className="text-8xl md:text-9xl mb-6"
          animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          🏆
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl font-tajawal font-[900] mb-4"
          style={{ color, textShadow: `0 0 40px ${color}60, 0 4px 16px rgba(0,0,0,0.4)` }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {winnerName} فاز!
        </motion.h1>

        <p className="text-cream/80 text-xl font-tajawal mb-8">مبروك! 🎉</p>

        <div className="flex gap-4 justify-center">
          <motion.button
            className="btn-golden px-8 py-3 rounded-xl font-tajawal font-bold text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
          >
            العب مرة أخرى
          </motion.button>
          <motion.button
            className="glass px-8 py-3 rounded-xl font-tajawal font-bold text-lg text-cream"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMainMenu}
          >
            القائمة الرئيسية
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WinnerOverlay;
