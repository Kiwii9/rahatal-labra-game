// ============================
// GuestJoin: Single room-code flow → team → details → waiting room
// One unified code (rooms.room_code), valid until host closes or 24h passes.
// ============================
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import GameFooter from "@/components/game/GameFooter";

const AVATARS = ['🦁', '🦅', '🐺', '🦊', '🐻', '🦈', '🐲', '🦄', '🐯', '🦉', '🐧', '🐙'];

const GuestJoin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Accept code from URL (?code=...) — legacy ?pin= also accepted as a fallback.
  const initialCode = (searchParams.get("code") || searchParams.get("pin") || "").toUpperCase();

  const [step, setStep] = useState<'code' | 'team' | 'details' | 'waiting'>('code');
  const [roomCode, setRoomCode] = useState(initialCode);
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState("");
  const [roomData, setRoomData] = useState<any>(null);
  const [connectedPlayers, setConnectedPlayers] = useState<any[]>([]);
  const [codeLoading, setCodeLoading] = useState(false);

  // Validate the unified room code
  const validateRoomCode = async (codeRaw: string) => {
    const code = codeRaw.trim().toUpperCase();
    if (!code) return;
    setCodeLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', code)
        .maybeSingle();
      if (err) throw err;
      if (!data) {
        setError('رمز الغرفة غير صحيح');
        return;
      }
      if ((data as any).status === 'closed' || (data as any).status === 'ended') {
        setError('تم إغلاق هذه الغرفة');
        return;
      }
      const createdAt = new Date((data as any).created_at).getTime();
      if (Date.now() - createdAt > 24 * 60 * 60 * 1000) {
        setError('انتهت صلاحية رمز الغرفة (٢٤ ساعة)');
        return;
      }
      setRoomData(data);
      setStep('team');
    } catch (e: any) {
      setError(e.message || 'حدث خطأ في التحقق');
    } finally {
      setCodeLoading(false);
    }
  };

  // Auto-validate if code came in via URL
  useEffect(() => {
    if (initialCode && initialCode.length >= 6) {
      validateRoomCode(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTeamSelect = (team: 'team1' | 'team2') => {
    setSelectedTeam(team);
    setStep('details');
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

  // Realtime: players + game start
  useEffect(() => {
    if (!roomData?.id) return;

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
          <AnimatePresence mode="wait">
            {/* Step 1: Room Code (only shown if no valid URL code) */}
            {step === 'code' && (
              <motion.div key="code" className="space-y-6 text-center" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-2xl font-tajawal font-[900] text-cream">أدخل رمز الغرفة</h2>
                <p className="text-cream/50 font-tajawal text-sm">احصل على الرمز من المضيف</p>
                <input
                  type="text"
                  inputMode="text"
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && roomCode.trim().length >= 6) validateRoomCode(roomCode); }}
                  placeholder="ABCDXYZW"
                  className="w-full border rounded-xl px-4 py-3 font-tajawal text-center focus:outline-none tracking-[0.4em] text-2xl uppercase"
                  style={{ backgroundColor: 'hsla(195, 42%, 18%, 0.6)', borderColor: 'hsla(25, 87%, 61%, 0.3)', color: 'hsl(40, 100%, 95%)' }}
                  dir="ltr"
                  maxLength={8}
                />
                <p className="text-cream/40 text-xs font-tajawal">8 أحرف وأرقام (مثال: KQXM7B3P)</p>
                <motion.button
                  className="w-full py-4 rounded-xl font-tajawal font-bold text-xl text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(25, 87%, 61%), hsl(25, 87%, 50%))' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => validateRoomCode(roomCode)}
                  disabled={codeLoading || !roomCode.trim()}
                >
                  {codeLoading ? 'جاري التحقق...' : 'دخول'}
                </motion.button>
                {error && <p className="text-red-400 font-tajawal text-sm">{error}</p>}
              </motion.div>
            )}

            {/* Step 2: Team selection */}
            {step === 'team' && (
              <motion.div key="team" className="space-y-6 text-center" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-2xl font-tajawal font-[900] text-cream">اختر فريقك</h2>
                <p className="text-cream/50 font-tajawal text-sm">رمز الغرفة: {roomData?.room_code}</p>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    className="py-8 rounded-xl font-tajawal font-bold text-xl text-white"
                    style={{ background: 'linear-gradient(135deg, hsl(25, 87%, 61%), hsl(25, 87%, 50%))' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTeamSelect('team1')}
                  >
                    {roomData?.team1_name || 'الفريق الأول'}
                  </motion.button>
                  <motion.button
                    className="py-8 rounded-xl font-tajawal font-bold text-xl text-white"
                    style={{ background: 'linear-gradient(135deg, hsl(222, 78%, 60%), hsl(222, 78%, 50%))' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTeamSelect('team2')}
                  >
                    {roomData?.team2_name || 'الفريق الثاني'}
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
                  <label className="mt-3 inline-block cursor-pointer text-cream/60 font-tajawal text-xs underline">
                    أو ارفع صورتك الخاصة
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 1024 * 1024) {
                          setError('حجم الصورة يجب أن يكون أقل من 1MB');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => setSelectedAvatar(reader.result as string);
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  {selectedAvatar.startsWith('data:') && (
                    <div className="mt-2 flex justify-center">
                      <img src={selectedAvatar} alt="avatar preview" className="w-16 h-16 rounded-full object-cover ring-2 ring-primary" />
                    </div>
                  )}
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

            {/* Step 4: Waiting room */}
            {step === 'waiting' && (
              <motion.div key="waiting" className="text-center space-y-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <motion.div
                  className="text-6xl"
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                >
                  {selectedAvatar.startsWith('data:')
                    ? <img src={selectedAvatar} alt="" className="w-20 h-20 rounded-full object-cover mx-auto" />
                    : selectedAvatar}
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
                  {selectedTeam === 'team1' ? (roomData?.team1_name || 'الفريق الأول') : (roomData?.team2_name || 'الفريق الثاني')}
                </div>

                <div className="space-y-4 mt-4">
                  <p className="text-cream/60 font-tajawal text-sm">اللاعبون المتصلون ({connectedPlayers.length})</p>

                  {team1Players.length > 0 && (
                    <div>
                      <p className="text-sm font-tajawal font-bold mb-2" style={{ color: 'hsl(25, 87%, 61%)' }}>{roomData?.team1_name || 'الفريق الأول'}</p>
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
                            {p.avatar_url?.startsWith('data:')
                              ? <img src={p.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                              : <span className="text-2xl">{p.avatar_url || '👤'}</span>}
                            <span className="text-cream/80 text-xs font-tajawal">{p.name}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {team2Players.length > 0 && (
                    <div>
                      <p className="text-sm font-tajawal font-bold mb-2" style={{ color: 'hsl(222, 78%, 60%)' }}>{roomData?.team2_name || 'الفريق الثاني'}</p>
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
                            {p.avatar_url?.startsWith('data:')
                              ? <img src={p.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                              : <span className="text-2xl">{p.avatar_url || '👤'}</span>}
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
