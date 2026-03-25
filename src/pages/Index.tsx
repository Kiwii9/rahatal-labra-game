// ============================
// Index: Main Menu - cinematic landing page
// ============================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import mascotImg from "@/assets/mascot.png";
import GameFooter from "@/components/game/GameFooter";

const Index = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [showJoin, setShowJoin] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #03222F 0%, #1B5967 50%, #03222F 100%)' }}>
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative sweep-light">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-10 w-40 h-40 rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, #E57A44, transparent)' }} />
          <div className="absolute bottom-20 left-10 w-60 h-60 rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
        </div>

        {/* Mascot */}
        <motion.img
          src={mascotImg}
          alt="رحّال"
          className="w-32 h-32 md:w-44 md:h-44 object-contain mb-6 drop-shadow-2xl"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-tajawal font-[900] leading-tight">
            <span className="text-cream" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>خلية </span>
            <span className="text-golden" style={{ textShadow: '0 0 30px rgba(250,204,21,0.3)' }}>الحروف</span>
          </h1>
          <p className="text-cream/70 text-lg md:text-xl font-tajawal mt-3">
            لعبة المعرفة والتحدي الجماعي
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col gap-4 w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {/* Host login */}
          <motion.button
            className="btn-golden w-full py-4 rounded-xl font-tajawal font-bold text-xl transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/lobby")}
          >
            🎙️ تسجيل دخول المضيف
          </motion.button>

          {/* Join game */}
          {!showJoin ? (
            <motion.button
              className="glass w-full py-4 rounded-xl font-tajawal font-bold text-xl text-cream transition-all hover:bg-cream/10"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowJoin(true)}
            >
              🎮 الانضمام للعبة
            </motion.button>
          ) : (
            <motion.div
              className="glass rounded-xl p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <p className="text-cream/70 text-sm font-tajawal mb-2">أدخل رمز الغرفة</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="flex-1 bg-midnight/50 border border-cream/20 rounded-lg px-4 py-3 text-cream text-center text-2xl font-tajawal tracking-[0.3em] placeholder:text-cream/30 focus:outline-none focus:border-golden"
                  dir="ltr"
                />
                <motion.button
                  className="btn-terracotta px-6 rounded-lg font-tajawal font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => roomCode.length === 6 && navigate(`/game?room=${roomCode}&role=player`)}
                  disabled={roomCode.length !== 6}
                >
                  دخول
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <GameFooter />
    </div>
  );
};

export default Index;
