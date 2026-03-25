// ============================
// QuestionModal: Fullscreen overlay with question/answer reveal
// Supports multimedia question schema
// ============================
import { motion, AnimatePresence } from "framer-motion";

interface QuestionModalProps {
  isOpen: boolean;
  letter: string;
  question: string;
  answer: string;
  category: string;
  isHost: boolean;
  answerRevealed: boolean;
  currentTurnColor: 'terracotta' | 'blue';
  team1Name: string;
  team2Name: string;
  imageUrl?: string;
  videoUrl?: string;
  onCorrectTeam1: () => void;
  onCorrectTeam2: () => void;
  onWrong: () => void;
  onClose: () => void;
}

const QuestionModal = ({
  isOpen, letter, question, answer, category,
  isHost, answerRevealed, currentTurnColor,
  team1Name, team2Name, imageUrl, videoUrl,
  onCorrectTeam1, onCorrectTeam2, onWrong, onClose,
}: QuestionModalProps) => {
  const accentColor = currentTurnColor === 'terracotta' ? '#f28b44' : '#4a80e8';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(26,54,68,0.92)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          <motion.div
            className="relative glass rounded-2xl p-6 md:p-10 max-w-2xl w-full text-center overflow-y-auto max-h-[90vh]"
            initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            style={{
              border: `2px solid ${accentColor}40`,
              boxShadow: `0 0 40px ${accentColor}20, 0 20px 60px rgba(0,0,0,0.5)`,
            }}
          >
            {/* Category badge */}
            <div
              className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-4 font-tajawal"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              {category}
            </div>

            {/* Letter */}
            <motion.div
              className="text-7xl md:text-8xl font-tajawal font-[900] my-4"
              style={{
                color: accentColor,
                textShadow: `0 0 30px ${accentColor}40, 0 4px 12px rgba(0,0,0,0.3)`,
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              {letter}
            </motion.div>

            {/* Multimedia content */}
            {imageUrl && (
              <img src={imageUrl} alt="" className="max-w-full max-h-48 object-contain mx-auto rounded-lg mb-4" />
            )}
            {videoUrl && (
              <video src={videoUrl} controls className="max-w-full max-h-48 mx-auto rounded-lg mb-4" />
            )}

            {/* Question text */}
            <p className="text-xl md:text-2xl font-tajawal leading-relaxed mb-8" style={{ color: 'hsl(var(--cream))' }}>
              {question}
            </p>

            {/* Answer section */}
            {(isHost || answerRevealed) && (
              <motion.div
                className="mb-6 p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(242,139,68,0.1)', border: '1px solid rgba(242,139,68,0.3)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs mb-1 font-bold font-tajawal" style={{ color: '#f28b44' }}>
                  {isHost && !answerRevealed ? 'الإجابة (مرئية للمضيف فقط)' : 'الإجابة'}
                </p>
                <p className="text-xl md:text-2xl font-tajawal font-bold" style={{ color: '#f28b44' }}>
                  {answer}
                </p>
              </motion.div>
            )}

            {/* Host controls */}
            {isHost && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <motion.button
                  className="px-6 py-3 rounded-xl font-tajawal font-bold text-base transition-all"
                  style={{ background: 'linear-gradient(135deg, #f28b44, #e07030)', color: '#fff' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCorrectTeam1}
                >
                  إجابة صحيحة - {team1Name}
                </motion.button>
                <motion.button
                  className="px-6 py-3 rounded-xl font-tajawal font-bold text-base transition-all"
                  style={{ background: 'linear-gradient(135deg, #4a80e8, #3668c0)', color: '#fff' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCorrectTeam2}
                >
                  إجابة صحيحة - {team2Name}
                </motion.button>
                <motion.button
                  className="px-6 py-3 rounded-xl font-tajawal font-bold text-base transition-all"
                  style={{
                    background: 'rgba(239,68,68,0.2)',
                    color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.3)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onWrong}
                >
                  إجابة خاطئة
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestionModal;
