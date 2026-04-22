// ============================
// Lobby: Host setup with PIN, QR code, connected players, team config
// ============================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useRoom } from "@/hooks/useRoom";
import GameTitle from "@/components/game/GameTitle";
import GameFooter from "@/components/game/GameFooter";

const Lobby = () => {
  const navigate = useNavigate();
  const { room, players, loading, createRoom, updateRoom } = useRoom();

  const [hostName, setHostName] = useState("رحّال");
  const [team1Name, setTeam1Name] = useState("الفريق الأول");
  const [team2Name, setTeam2Name] = useState("الفريق الثاني");
  const [team1Color, setTeam1Color] = useState<'terracotta' | 'blue'>('terracotta');
  const [initialized, setInitialized] = useState(false);

  const team2Color = team1Color === 'terracotta' ? 'blue' : 'terracotta';

  // Create room on mount
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      createRoom(hostName);
    }
  }, [initialized, createRoom, hostName]);

  const guestJoinUrl = room ? `${window.location.origin}/join?pin=${room.pin}` : '';
  const hostControllerUrl = room ? `${window.location.origin}/host-controller?room=${room.id}` : '';

  const team1Players = players.filter(p => p.team === 'team1');
  const team2Players = players.filter(p => p.team === 'team2');

  const startGame = async () => {
    if (!room) return;
    await updateRoom({
      status: 'playing',
      host_name: hostName,
      team1_name: team1Name,
      team2_name: team2Name,
      team1_color: team1Color,
      team2_color: team2Color,
    } as any);

    const params = new URLSearchParams({
      role: 'host',
      room: room.id,
      t1: team1Name,
      t2: team2Name,
      t1c: team1Color,
      t2c: team2Color,
      host: hostName,
    });
    navigate(`/game?${params.toString()}`);
  };

  const inputStyle = {
    backgroundColor: 'hsla(195, 42%, 18%, 0.6)',
    borderColor: 'hsla(0, 0%, 100%, 0.15)',
    color: 'hsl(40, 100%, 95%)',
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: 'hsl(195, 42%, 18%)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'url(/patterns/tribal-pattern.webp)', backgroundSize: '300px', backgroundRepeat: 'repeat', opacity: 0.04, mixBlendMode: 'soft-light' }} />
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          className="glass rounded-2xl p-6 md:p-8 max-w-2xl w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        >
          {/* Title */}
          <div className="mb-5">
            <GameTitle hostName={hostName} className="scale-75 origin-center" />
          </div>

          {loading && (
            <div className="text-center py-8">
              <motion.p className="text-cream/50 font-tajawal" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                جاري إنشاء الغرفة...
              </motion.p>
            </div>
          )}

          {room && (
            <div className="space-y-5">
              {/* PIN + QR row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Game PIN */}
                <div className="text-center">
                  <p className="text-cream/60 text-sm font-tajawal mb-1">رمز اللعبة للاعبين</p>
                  <div
                    className="text-3xl md:text-4xl font-tajawal font-[900] tracking-[0.3em] py-3 rounded-xl"
                    style={{ color: 'hsl(25, 87%, 61%)', backgroundColor: 'hsla(25, 87%, 61%, 0.1)', border: '1px solid hsla(25, 87%, 61%, 0.2)' }}
                    dir="ltr"
                  >
                    {room.pin}
                  </div>
                  <p className="text-cream/40 text-xs font-tajawal mt-2 break-all" dir="ltr">
                    {guestJoinUrl}
                  </p>
                </div>

                {/* QR Code for host mobile controller */}
                <div className="text-center">
                  <p className="text-cream/60 text-sm font-tajawal mb-1">امسح للتحكم من الموبايل</p>
                  <div className="inline-block bg-white p-3 rounded-xl">
                    <QRCodeSVG value={hostControllerUrl} size={120} />
                  </div>
                  <p className="text-cream/40 text-xs font-tajawal mt-2">لوحة تحكم المضيف</p>
                </div>
              </div>

              {/* Player activation code (host-visible only, copyable) */}
              {(room as any).room_code && (
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: 'hsla(48, 96%, 53%, 0.08)', border: '1px solid hsla(48, 96%, 53%, 0.3)' }}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-right">
                      <p className="text-cream/70 text-sm font-tajawal mb-1">🔑 رمز تفعيل اللاعبين (٣ استخدامات)</p>
                      <p className="text-cream/40 text-xs font-tajawal">شارك هذا الرمز مع لاعبيك فقط</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code
                        className="text-2xl font-tajawal font-[900] tracking-[0.3em] px-4 py-2 rounded-lg"
                        style={{ color: 'hsl(48, 96%, 60%)', backgroundColor: 'hsla(48, 96%, 53%, 0.1)' }}
                        dir="ltr"
                      >
                        {(room as any).room_code}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText((room as any).room_code);
                        }}
                        className="px-3 py-2 rounded-lg font-tajawal text-sm text-white"
                        style={{ background: 'linear-gradient(135deg, hsl(48, 96%, 53%), hsl(48, 96%, 43%))' }}
                      >
                        نسخ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Host name */}
              <div>
                <label className="text-cream/60 text-sm font-tajawal block mb-1">اسم المضيف</label>
                <input
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="أدخل اسمك هنا"
                  className="w-full border rounded-lg px-4 py-3 font-tajawal focus:outline-none"
                  style={inputStyle}
                />
              </div>

              {/* Teams config */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Team 1 */}
                <div>
                  <label className="text-cream/60 text-sm font-tajawal block mb-1">الفريق الأول (أعلى ↔ أسفل)</label>
                  <input
                    value={team1Name}
                    onChange={(e) => setTeam1Name(e.target.value)}
                    className="w-full border rounded-lg px-4 py-3 font-tajawal focus:outline-none mb-2"
                    style={inputStyle}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTeam1Color('terracotta')}
                      className={`flex-1 py-2 rounded-lg font-tajawal font-bold text-sm text-white transition-all ${team1Color === 'terracotta' ? 'ring-2 ring-white/50 scale-105' : 'opacity-60'}`}
                      style={{ background: 'linear-gradient(135deg, hsl(25, 87%, 61%), hsl(25, 87%, 50%))' }}
                    >
                      برتقالي
                    </button>
                    <button
                      onClick={() => setTeam1Color('blue')}
                      className={`flex-1 py-2 rounded-lg font-tajawal font-bold text-sm text-white transition-all ${team1Color === 'blue' ? 'ring-2 ring-white/50 scale-105' : 'opacity-60'}`}
                      style={{ background: 'linear-gradient(135deg, hsl(222, 78%, 60%), hsl(222, 78%, 50%))' }}
                    >
                      أزرق
                    </button>
                  </div>

                  {/* Connected team 1 players */}
                  {team1Players.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {team1Players.map(p => (
                        <div key={p.id} className="text-cream/70 text-sm font-tajawal flex items-center gap-2">
                          <span>{p.avatar_url}</span> {p.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Team 2 */}
                <div>
                  <label className="text-cream/60 text-sm font-tajawal block mb-1">الفريق الثاني (يمين ↔ يسار)</label>
                  <input
                    value={team2Name}
                    onChange={(e) => setTeam2Name(e.target.value)}
                    className="w-full border rounded-lg px-4 py-3 font-tajawal focus:outline-none mb-2"
                    style={inputStyle}
                  />
                  <div
                    className="py-2 rounded-lg font-tajawal font-bold text-sm text-center text-white opacity-70"
                    style={{
                      background: team2Color === 'terracotta'
                        ? 'linear-gradient(135deg, hsl(25, 87%, 61%), hsl(25, 87%, 50%))'
                        : 'linear-gradient(135deg, hsl(222, 78%, 60%), hsl(222, 78%, 50%))',
                    }}
                  >
                    {team2Color === 'terracotta' ? 'برتقالي' : 'أزرق'} (تلقائي)
                  </div>

                  {team2Players.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {team2Players.map(p => (
                        <div key={p.id} className="text-cream/70 text-sm font-tajawal flex items-center gap-2">
                          <span>{p.avatar_url}</span> {p.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Player count */}
              <div className="text-center text-cream/40 font-tajawal text-sm">
                {players.length} لاعب متصل
              </div>

              {/* Start game */}
              <motion.button
                className="w-full py-4 rounded-xl font-tajawal font-[900] text-xl text-white"
                style={{
                  background: 'linear-gradient(135deg, hsl(25, 87%, 61%), hsl(25, 87%, 50%))',
                  boxShadow: '0 0 20px hsla(25, 87%, 61%, 0.4)',
                }}
                whileHover={{ scale: 1.03, boxShadow: '0 0 30px hsla(25, 87%, 61%, 0.6)' }}
                whileTap={{ scale: 0.97 }}
                onClick={startGame}
              >
                ابدأ اللعبة
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      <GameFooter />
    </div>
  );
};

export default Lobby;
