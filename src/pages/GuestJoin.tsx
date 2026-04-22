// ============================
// GuestJoin: Guest registration flow - team selection, name, avatar, activation code
// Then waiting room with realtime connected players
// ============================
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import GameFooter from "@/components/game/GameFooter";

const AVATARS = ['🦁', '🦅', '🐺', '🦊', '🐻', '🦈', '🐲', '🦄'];

const GuestJoin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pin = searchParams.get("pin") || "";

  const [step, setStep] = useState<'code' | 'team' | 'details' | 'waiting'>('code');
  const [activationCode, setActivationCode] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState("");
  const [roomData, setRoomData] = useState<any>(null);
  const [connectedPlayers, setConnectedPlayers] = useState<any[]>([]);
  const [codeLoading, setCodeLoading] = useState(false);

  // Validate player activation code
  const handleCodeValidation = async () => {
    if (!activationCode.trim()) return;
    setCodeLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase.rpc('consume_activation_code', {
        p_code: activationCode.trim()
      });
      if (err) throw err;
      const result = data as any;
      if (result?.valid) {
        setStep('team');
      } else {
        setError(result?.message || 'رمز غير صالح');
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ في التحقق');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleTeamSelect = async (team: 'team1' | 'team2') => {
    setSelectedTeam(team);
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
      const { error: err } = await supabase.from('players').insert({
        room_id: roomData.id,
        user_id: null,
        name: playerName,
        team: selectedTeam,
        avatar_url: selectedAvatar,
      });
      if (err) throw err;
      setStep('waiting');
    } catch (e: any) {
      setError(e.message || 'حدث خطأ');
    }
  };

  // Realtime: listen for players joining and game start
  useEffect(() => {
    if (!roomData?.id) return;

    // Fetch initial players
    supabase.from('players').select('*').eq('room_id', roomData.id).then(({ data }) => {
      if (data) setConnectedPlayers(data);
    });

    const channel = supabase.channel(`guest-room-${roomData.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomData.id}`,
      }, () => {
        // Refetch all players on any change
        supabase.from('players').select('*').eq('room_id', roomData.id).then(({ data }) => {
          if (data) setConnectedPlayers(data);
        });
      })
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

    return () => { supabase.removeChannel(channel); };
  }, [roomData?.id, navigate, selectedTeam, playerName]);

  const team1Players = connectedPlayers.filter(p => p.team === 'team1');
  const team2Players = connectedPlayers.filter(p => p.team === 'team2');

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: 'hsl(195, 42%, 18%)' }}>
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/patterns/tribal-pattern.webp)',
          backgroundSize: '300px',
          backgroundRepeat: 'repeat',
          opacity: 0.04,
          mixBlendMode: 'soft-light',
        }}
      />

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          className="glass rounded-2xl p-6 md:p-8 max-w-md w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Step 1: Activation Code */}
          <AnimatePresence mode="wait">
            {step === 'code' && (
              <motion.div key="code" className="space-y-6 text-center" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-2xl font-tajawal font-[900] text-cream">أدخل رمز الدخول</h2>
                <p className="text-cream/50 font-tajawal text-sm">رمز الغرفة: {pin}</p>
                <input
                  type="password"
                  autoComplete="off"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                  placeholder="أدخل رمز التفعيل"
                  className="w-full border rounded-xl px-4 py-3 font-tajawal text-center focus:outline-none tracking-[0.4em]"
                  style={{ backgroundColor: 'hsla(195, 42%, 18%, 0.6)', borderColor: 'hsla(25, 87%, 61%, 0.3)', color: 'hsl(40, 100%, 95%)' }}
                  dir="ltr"
                  maxLength={20}
                />
                <p className="text-cream/40 text-xs font-tajawal -mt-3">{activationCode.length} حرفاً</p>
                <motion.button
                  className="w-full py-4 rounded-xl font-tajawal font-bold text-xl text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(25, 87%, 61%), hsl(25, 87%, 50%))' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCodeValidation}
                  disabled={codeLoading || !activationCode.trim()}
                >
                  {codeLoading ? 'جاري التحقق...' : 'تحقق'}
                </motion.button>
                {error && <p className="text-red-400 font-tajawal text-sm">{error}</p>}
              </motion.div>
            )}

            {/* Step 2: Team selection */}
            {step === 'team' && (
              <motion.div key="team" className="space-y-6 text-center" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
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
              </motion.div>
            )}

            {/* Step 3: Player details */}
            {step === 'details' && (
              <motion.div key="details" className="space-y-5 text-center" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-2xl font-tajawal font-[900] text-cream">أدخل بياناتك</h2>
                <input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="اسمك"
                  className="w-full border rounded-xl px-4 py-3 font-tajawal text-center focus:outline-none"
                  style={{ backgroundColor: 'hsla(195, 42%, 18%, 0.6)', borderColor: 'hsla(0, 0%, 100%, 0.15)', color: 'hsl(40, 100%, 95%)' }}
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
              </motion.div>
            )}

            {/* Step 4: Waiting room with realtime players */}
            {step === 'waiting' && (
              <motion.div key="waiting" className="text-center space-y-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <motion.div
                  className="text-6xl"
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
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

                {/* Team badge */}
                <div
                  className="inline-block px-4 py-2 rounded-full font-tajawal font-bold"
                  style={{
                    backgroundColor: selectedTeam === 'team1' ? 'hsla(25, 87%, 61%, 0.2)' : 'hsla(222, 78%, 60%, 0.2)',
                    color: selectedTeam === 'team1' ? 'hsl(25, 87%, 61%)' : 'hsl(222, 78%, 60%)',
                  }}
                >
                  {selectedTeam === 'team1' ? 'الفريق الأول' : 'الفريق الثاني'}
                </div>

                {/* Realtime connected players */}
                <div className="space-y-4 mt-4">
                  <p className="text-cream/60 font-tajawal text-sm">اللاعبون المتصلون ({connectedPlayers.length})</p>

                  {/* Team 1 players */}
                  {team1Players.length > 0 && (
                    <div>
                      <p className="text-sm font-tajawal font-bold mb-2" style={{ color: 'hsl(25, 87%, 61%)' }}>الفريق الأول</p>
                      <div className="flex flex-wrap justify-center gap-3">
                        {team1Players.map((p, i) => (
                          <motion.div
                            key={p.id}
                            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl"
                            style={{ backgroundColor: 'hsla(25, 87%, 61%, 0.1)', border: '1px solid hsla(25, 87%, 61%, 0.2)' }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <span className="text-2xl">{p.avatar_url || '👤'}</span>
                            <span className="text-cream/80 text-xs font-tajawal">{p.name}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Team 2 players */}
                  {team2Players.length > 0 && (
                    <div>
                      <p className="text-sm font-tajawal font-bold mb-2" style={{ color: 'hsl(222, 78%, 60%)' }}>الفريق الثاني</p>
                      <div className="flex flex-wrap justify-center gap-3">
                        {team2Players.map((p, i) => (
                          <motion.div
                            key={p.id}
                            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl"
                            style={{ backgroundColor: 'hsla(222, 78%, 60%, 0.1)', border: '1px solid hsla(222, 78%, 60%, 0.2)' }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <span className="text-2xl">{p.avatar_url || '👤'}</span>
                            <span className="text-cream/80 text-xs font-tajawal">{p.name}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <GameFooter />
    </div>
  );
};

export default GuestJoin;
