// ============================
// GuestJoin: Guest registration flow - team selection, name, avatar
// ============================
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import GameFooter from "@/components/game/GameFooter";

const AVATARS = ['🦁', '🦅', '🐺', '🦊', '🐻', '🦈', '🐲', '🦄'];

const GuestJoin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pin = searchParams.get("pin") || "";

  const [step, setStep] = useState<'team' | 'details' | 'waiting'>('team');
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState("");
  const [roomData, setRoomData] = useState<any>(null);

  const handleTeamSelect = async (team: 'team1' | 'team2') => {
    setSelectedTeam(team);
    // Fetch room data
    const { data } = await supabase.from('rooms').select('*').eq('pin', pin).single();
    if (data) {
      setRoomData(data);
      setStep('details');
    } else {
      setError('الغرفة غير موجودة');
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !selectedTeam || !roomData) return;
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: err } = await supabase.from('players').insert({
        room_id: roomData.id,
        user_id: user?.id || null,
        name: playerName,
        team: selectedTeam,
        avatar_url: selectedAvatar,
      } as any);

      if (err) throw err;
      setStep('waiting');

      // Listen for game start
      const channel = supabase.channel(`guest-wait-${roomData.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomData.id}`,
        }, (payload) => {
          if ((payload.new as any).status === 'playing') {
            navigate(`/buzzer?room=${roomData.id}&team=${selectedTeam}&name=${encodeURIComponent(playerName)}`);
          }
        })
        .subscribe();

    } catch (e: any) {
      setError(e.message || 'حدث خطأ');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="glass rounded-2xl p-6 md:p-8 max-w-md w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Team selection */}
          {step === 'team' && (
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-tajawal font-[900] text-cream">اختر فريقك</h2>
              <p className="text-cream/50 font-tajawal text-sm">رمز الغرفة: {pin}</p>

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  className="py-8 rounded-xl font-tajawal font-bold text-xl text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(25, 87%, 61%), hsl(25, 87%, 50%))' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTeamSelect('team1')}
                >
                  الفريق الأول
                  <br />
                  <span className="text-sm opacity-70">أعلى ↔ أسفل</span>
                </motion.button>
                <motion.button
                  className="py-8 rounded-xl font-tajawal font-bold text-xl text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(222, 78%, 60%), hsl(222, 78%, 50%))' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTeamSelect('team2')}
                >
                  الفريق الثاني
                  <br />
                  <span className="text-sm opacity-70">يمين ↔ يسار</span>
                </motion.button>
              </div>
              {error && <p className="text-red-400 font-tajawal text-sm">{error}</p>}
            </div>
          )}

          {/* Player details */}
          {step === 'details' && (
            <div className="space-y-5 text-center">
              <h2 className="text-2xl font-tajawal font-[900] text-cream">أدخل بياناتك</h2>

              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="اسمك"
                className="w-full border rounded-xl px-4 py-3 font-tajawal text-center bg-background/60 text-cream focus:outline-none"
                style={{ borderColor: 'hsla(0, 0%, 100%, 0.15)' }}
              />

              <div>
                <p className="text-cream/60 font-tajawal text-sm mb-2">اختر صورتك</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      className={`text-3xl p-2 rounded-lg transition-all ${selectedAvatar === a ? 'ring-2 ring-primary scale-110' : 'opacity-50'}`}
                      onClick={() => setSelectedAvatar(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                className="w-full py-4 rounded-xl font-tajawal font-bold text-xl text-white"
                style={{ background: 'linear-gradient(135deg, hsl(25, 87%, 61%), hsl(25, 87%, 50%))' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleJoin}
                disabled={!playerName.trim()}
              >
                انضم للعبة
              </motion.button>
              {error && <p className="text-red-400 font-tajawal text-sm">{error}</p>}
            </div>
          )}

          {/* Waiting room */}
          {step === 'waiting' && (
            <div className="text-center space-y-6">
              <motion.div
                className="text-6xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {selectedAvatar}
              </motion.div>
              <h2 className="text-2xl font-tajawal font-[900] text-cream">مرحباً {playerName}!</h2>
              <motion.p
                className="text-cream/50 font-tajawal text-lg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                في انتظار بدء اللعبة من المضيف...
              </motion.p>
              <div
                className="inline-block px-4 py-2 rounded-full font-tajawal font-bold"
                style={{
                  backgroundColor: selectedTeam === 'team1' ? 'hsla(25, 87%, 61%, 0.2)' : 'hsla(222, 78%, 60%, 0.2)',
                  color: selectedTeam === 'team1' ? 'hsl(25, 87%, 61%)' : 'hsl(222, 78%, 60%)',
                }}
              >
                {selectedTeam === 'team1' ? 'الفريق الأول' : 'الفريق الثاني'}
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <GameFooter />
    </div>
  );
};

export default GuestJoin;
