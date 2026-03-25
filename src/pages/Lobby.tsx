// ============================
// Lobby: Team setup, host name, game PIN, QR code
// ============================
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GameTitle from "@/components/game/GameTitle";
import GameFooter from "@/components/game/GameFooter";

const Lobby = () => {
  const navigate = useNavigate();
  const [team1Name, setTeam1Name] = useState("الفريق الأول");
  const [team2Name, setTeam2Name] = useState("الفريق الثاني");
  const [team1Color, setTeam1Color] = useState<'terracotta' | 'blue'>('terracotta');
  const [hostName, setHostName] = useState("");

  const team2Color = team1Color === 'terracotta' ? 'blue' : 'terracotta';

  // Generate a random PIN
  const gamePin = useMemo(() => String(Math.floor(100000 + Math.random() * 900000)), []);

  const gameUrl = `${window.location.origin}/game?room=${gamePin}&role=player`;

  const startGame = () => {
    const params = new URLSearchParams({
      role: 'host',
      t1: team1Name,
      t2: team2Name,
      t1c: team1Color,
      t2c: team2Color,
      host: hostName || 'رحّال',
    });
    navigate(`/game?${params.toString()}`);
  };

  const inputStyle = {
    backgroundColor: 'rgba(26,54,68,0.6)',
    borderColor: 'rgba(255,255,255,0.15)',
    color: 'hsl(var(--cream))',
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: '#1a3644' }}>
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="glass rounded-2xl p-6 md:p-10 max-w-lg w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        >
          {/* Title preview */}
          <div className="mb-6">
            <GameTitle hostName={hostName || 'رحّال'} className="scale-75 origin-center" />
          </div>

          {/* Game PIN */}
          <div className="mb-6 text-center">
            <p className="text-cream/60 text-sm font-tajawal mb-1">رمز اللعبة</p>
            <div
              className="text-4xl font-tajawal font-[900] tracking-[0.4em] py-3 rounded-xl"
              style={{ color: '#f28b44', backgroundColor: 'rgba(242,139,68,0.1)', border: '1px solid rgba(242,139,68,0.2)' }}
              dir="ltr"
            >
              {gamePin}
            </div>
            <p className="text-cream/40 text-xs font-tajawal mt-2 break-all" dir="ltr">
              {gameUrl}
            </p>
          </div>

          {/* Host name */}
          <div className="mb-5">
            <label className="text-cream/60 text-sm font-tajawal block mb-1">اسم المضيف</label>
            <input
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="أدخل اسمك هنا"
              className="w-full border rounded-lg px-4 py-3 font-tajawal focus:outline-none"
              style={inputStyle}
            />
          </div>

          {/* Team 1 */}
          <div className="mb-5">
            <label className="text-cream/60 text-sm font-tajawal block mb-1">
              الفريق الأول (أعلى ↔ أسفل)
            </label>
            <input
              value={team1Name}
              onChange={(e) => setTeam1Name(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 font-tajawal focus:outline-none mb-2"
              style={inputStyle}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setTeam1Color('terracotta')}
                className={`flex-1 py-2 rounded-lg font-tajawal font-bold text-sm text-white transition-all ${
                  team1Color === 'terracotta' ? 'ring-2 ring-white/50 scale-105' : 'opacity-60'
                }`}
                style={{ background: 'linear-gradient(135deg, #f28b44, #e07030)' }}
              >
                برتقالي
              </button>
              <button
                onClick={() => setTeam1Color('blue')}
                className={`flex-1 py-2 rounded-lg font-tajawal font-bold text-sm text-white transition-all ${
                  team1Color === 'blue' ? 'ring-2 ring-white/50 scale-105' : 'opacity-60'
                }`}
                style={{ background: 'linear-gradient(135deg, #4a80e8, #3668c0)' }}
              >
                أزرق
              </button>
            </div>
          </div>

          {/* Team 2 */}
          <div className="mb-6">
            <label className="text-cream/60 text-sm font-tajawal block mb-1">
              الفريق الثاني (يمين ↔ يسار)
            </label>
            <input
              value={team2Name}
              onChange={(e) => setTeam2Name(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 font-tajawal focus:outline-none mb-2"
              style={inputStyle}
            />
            <div
              className="py-2 rounded-lg font-tajawal font-bold text-sm text-center text-white"
              style={{
                background: team2Color === 'terracotta'
                  ? 'linear-gradient(135deg, #f28b44, #e07030)'
                  : 'linear-gradient(135deg, #4a80e8, #3668c0)',
                opacity: 0.7,
              }}
            >
              {team2Color === 'terracotta' ? 'برتقالي' : 'أزرق'} (تلقائي)
            </div>
          </div>

          {/* Start */}
          <motion.button
            className="w-full py-4 rounded-xl font-tajawal font-[900] text-xl text-white"
            style={{
              background: 'linear-gradient(135deg, #f28b44, #e07030)',
              boxShadow: '0 0 20px rgba(242,139,68,0.4)',
            }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(242,139,68,0.6)' }}
            whileTap={{ scale: 0.97 }}
            onClick={startGame}
          >
            ابدأ اللعبة
          </motion.button>
        </motion.div>
      </div>

      <GameFooter />
    </div>
  );
};

export default Lobby;
