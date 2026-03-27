// ============================
// PreQuestionModal: Islamic reminder - shown once at game start OR before question
// ============================
import { motion, AnimatePresence } from "framer-motion";

interface PreQuestionModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  isGameStart?: boolean;
}

const PreQuestionModal = ({ isOpen, onDismiss, isGameStart = false }: PreQuestionModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(26,54,68,0.92)', backdropFilter: 'blur(8px)' }}
          />

          <motion.div
            className="relative glass rounded-2xl p-8 md:p-12 max-w-md w-full text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            style={{
              border: '2px solid rgba(242,139,68,0.3)',
              boxShadow: '0 0 60px rgba(242,139,68,0.15), 0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Decorative bismillah-style top ornament */}
            <div className="text-4xl mb-6" style={{ color: '#f28b44' }}>
              ﷽
            </div>

            <p
              className="text-xl md:text-2xl font-tajawal font-bold leading-relaxed mb-8"
              style={{ color: 'hsl(var(--cream))' }}
            >
              قبل السؤال صلوا على النبي
              <br />
              تعوذوا من الشيطان
            </p>

            <motion.button
              className="px-8 py-3 rounded-xl font-tajawal font-bold text-lg transition-all"
              style={{
                background: 'linear-gradient(135deg, #f28b44, #e07030)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(242,139,68,0.4)',
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(242,139,68,0.6)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onDismiss}
            >
              {isGameStart ? 'ابدأ اللعب' : 'إظهار السؤال'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PreQuestionModal;
