// ============================
// Lobby: Team setup, color selection, and game start
// ============================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import mascotImg from "@/assets/mascot.png";

const Lobby = () => {
  const navigate = useNavigate();
  const [team1Name, setTeam1Name] = useState("الفريق الأول");
  const [team2Name, setTeam2Name] = useState("الفريق الثاني");
  const [team1Color, setTeam1Color] = useState<'terracotta' | 'blue'>('terracotta');
  const [hostName, setHostName] = useState("رحّال");

  const team2Color = team1Color === 'terracotta' ? 'blue' : 'terracotta';

  const startGame = () => {
    const params = new URLSearchParams({
      role: 'host',
      t1: team1Name,
      t2: team2Name,
      t1c: team1Color,
      t2c: team2Color,
      host: hostName,
    });
    navigate(`/game?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 stage-bg sweep-light">
      <motion.div
        className="glass rounded-2xl p-8 md:p-12 max-w-lg w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
      >
        <div className="text-center mb-8">
          <img src={mascotImg} alt="رحّال" className="w-20 h-20 object-contain mx-auto mb-4" />
          <h1 className="text-3xl font-tajawal font-[900] text-cream">إعداد اللعبة</h1>
        </div>

        {/* Host name */}
        <div className="mb-6">
          <label className="text-cream/70 text-sm font-tajawal block mb-1">اسم المضيف</label>
          <input
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            className="w-full bg-midnight/50 border border-cream/20 rounded-lg px-4 py-3 text-cream font-tajawal focus:outline-none focus:border-golden"
          />
        </div>

        {/* Team 1 */}
        <div className="mb-6">
          <label className="text-cream/70 text-sm font-tajawal block mb-1">اسم الفريق الأول (أعلى ↔ أسفل)</label>
          <input
            value={team1Name}
            onChange={(e) => setTeam1Name(e.target.value)}
            className="w-full bg-midnight/50 border border-cream/20 rounded-lg px-4 py-3 text-cream font-tajawal focus:outline-none focus:border-golden mb-3"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setTeam1Color('terracotta')}
              className={`flex-1 py-2 rounded-lg font-tajawal font-bold text-sm transition-all ${
                team1Color === 'terracotta'
                  ? 'ring-2 ring-golden scale-105'
                  : 'opacity-60'
              }`}
              style={{ backgroundColor: '#E57A44', color: '#fff' }}
            >
              🟠 برتقالي
            </button>
            <button
              onClick={() => setTeam1Color('blue')}
              className={`flex-1 py-2 rounded-lg font-tajawal font-bold text-sm transition-all ${
                team1Color === 'blue'
                  ? 'ring-2 ring-golden scale-105'
                  : 'opacity-60'
              }`}
              style={{ backgroundColor: '#3B82F6', color: '#fff' }}
            >
              🔵 أزرق
            </button>
          </div>
        </div>

        {/* Team 2 */}
        <div className="mb-8">
          <label className="text-cream/70 text-sm font-tajawal block mb-1">اسم الفريق الثاني (يمين ↔ يسار)</label>
          <input
            value={team2Name}
            onChange={(e) => setTeam2Name(e.target.value)}
            className="w-full bg-midnight/50 border border-cream/20 rounded-lg px-4 py-3 text-cream font-tajawal focus:outline-none focus:border-golden mb-3"
          />
          <div className="flex items-center gap-2">
            <div
              className="flex-1 py-2 rounded-lg font-tajawal font-bold text-sm text-center ring-2 ring-golden"
              style={{ backgroundColor: team2Color === 'terracotta' ? '#E57A44' : '#3B82F6', color: '#fff' }}
            >
              {team2Color === 'terracotta' ? '🟠 برتقالي' : '🔵 أزرق'} (تلقائي)
            </div>
          </div>
        </div>

        {/* Start button */}
        <motion.button
          className="btn-golden w-full py-4 rounded-xl font-tajawal font-[900] text-xl"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={startGame}
        >
          🚀 ابدأ اللعبة
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Lobby;
