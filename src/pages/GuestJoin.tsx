// ============================
// GuestJoin: Room code → team → avatar (icons OR Cloud upload) → waiting room
// Avatar custom uploads stored in Lovable Cloud public 'avatars' bucket; circular mask in UI.
// ============================
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import GameFooter from "@/components/game/GameFooter";
import { AVATAR_ICONS, getIconByKey } from "@/components/icons/AvatarIcons";

// `avatar_url` may be:
//   - "icon:crown" (built-in vector icon key)
//   - "https://..."  (Cloud storage public URL)
const ICON_PREFIX = 'icon:';

const GuestJoin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCode = (searchParams.get("code") || searchParams.get("pin") || "").toUpperCase();

  const [step, setStep] = useState<'code' | 'team' | 'details' | 'waiting'>('code');
  const [roomCode, setRoomCode] = useState(initialCode);
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [avatar, setAvatar] = useState<string>(`${ICON_PREFIX}crown`);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [roomData, setRoomData] = useState<any>(null);
  const [connectedPlayers, setConnectedPlayers] = useState<any[]>([]);
  const [codeLoading, setCodeLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateRoomCode = async (codeRaw: string) => {
    const code = codeRaw.trim().toUpperCase();
    if (!code) return;
    setCodeLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase
        .from('rooms').select('*').eq('room_code', code).maybeSingle();
      if (err) throw err;
      if (!data) { setError('رمز الغرفة غير صحيح'); return; }
      if ((data as any).status === 'closed' || (data as any).status === 'ended') {
        setError('تم إغلاق هذه الغرفة'); return;
      }
      const createdAt = new Date((data as any).created_at).getTime();
      if (Date.now() - createdAt > 24 * 60 * 60 * 1000) {
        setError('انتهت صلاحية رمز الغرفة (٢٤ ساعة)'); return;
      }
      setRoomData(data);
      setStep('team');
    } catch (e: any) {
      setError(e.message || 'حدث خطأ في التحقق');
    } finally {
      setCodeLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode && initialCode.length >= 6) validateRoomCode(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTeamSelect = (team: 'team1' | 'team2') => {
    setSelectedTeam(team);
    setStep('details');
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('حجم الصورة يجب أن يكون أقل من 2MB'); return; }
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) { setError('نوع الصورة غير مدعوم (PNG/JPG/WEBP/GIF فقط)'); return; }
    setError("");
    setUploading(true);
    try {
      // Storage RLS requires an authenticated identity. For anonymous guests,
      // create an anonymous Supabase session so uploads land under their own
      // <uid>/ folder (no one else can overwrite them).
      let { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const { data: anonData, error: anonErr } = await (supabase.auth as any).signInAnonymously?.() ?? { data: null, error: new Error('Anonymous auth unavailable') };
        if (anonErr) throw anonErr;
        user = anonData?.user ?? null;
      }
      if (!user) throw new Error('تعذر تجهيز جلسة الرفع');
      const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
        contentType: file.type, cacheControl: '3600', upsert: false,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatar(pub.publicUrl);
    } catch (e: any) {
      setError(e.message || 'فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !selectedTeam || !roomData) return;
    setError("");
    try {
      const { error: err } = await supabase.from('players').insert({
        room_id: roomData.id, user_id: null,
        name: playerName, team: selectedTeam,
        avatar_url: avatar,
      });
      if (err) throw err;
      setStep('waiting');
    } catch (e: any) {
      setError(e.message || 'حدث خطأ');
    }
  };

  // Realtime
  useEffect(() => {
    if (!roomData?.id) return;
    supabase.from('players').select('*').eq('room_id', roomData.id).then(({ data }) => {
      if (data) setConnectedPlayers(data);
    });
    const channel = supabase.channel(`guest-room-${roomData.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomData.id}` }, () => {
        supabase.from('players').select('*').eq('room_id', roomData.id).then(({ data }) => {
          if (data) setConnectedPlayers(data);
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomData.id}` }, (payload) => {
        if ((payload.new as any).status === 'playing') {
          navigate(`/buzzer?room=${roomData.id}&team=${selectedTeam}&name=${encodeURIComponent(playerName)}`);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomData?.id, navigate, selectedTeam, playerName]);

  // Resolve assigned team color/name from room
  const teamColorHex = (team: 'team1' | 'team2' | null) => {
    if (!team || !roomData) return 'hsl(45, 90%, 55%)';
    const c = team === 'team1' ? roomData.team1_color : roomData.team2_color;
    return c === 'blue' ? 'hsl(222, 70%, 55%)' : 'hsl(25, 87%, 58%)';
  };
  const teamName = (team: 'team1' | 'team2' | null) => {
    if (!team || !roomData) return '';
    return team === 'team1' ? (roomData.team1_name || 'الفريق الأول') : (roomData.team2_name || 'الفريق الثاني');
  };

  const team1Players = connectedPlayers.filter(p => p.team === 'team1');
  const team2Players = connectedPlayers.filter(p => p.team === 'team2');

  // Render avatar (circular mask always)
  const Avatar = ({ value, size = 40 }: { value: string; size?: number }) => {
    const isIcon = value?.startsWith(ICON_PREFIX);
    if (isIcon) {
      const def = getIconByKey(value.slice(ICON_PREFIX.length));
      const Comp = def?.Comp;
      return (
        <div className="rounded-full flex items-center justify-center"
          style={{ width: size, height: size, background: 'hsla(195, 60%, 12%, 0.6)', border: '1px solid hsla(45, 60%, 55%, 0.4)', color: 'hsl(45, 92%, 60%)' }}>
          {Comp && <Comp width={size * 0.6} height={size * 0.6} />}
        </div>
      );
    }
    return (
      <img src={value} alt="" className="rounded-full object-cover"
        style={{ width: size, height: size, border: '1px solid hsla(45, 60%, 55%, 0.4)' }} />
    );
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: 'hsl(195, 60%, 8%)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'url(/patterns/tribal-pattern.webp)', backgroundSize: '300px', opacity: 0.05, mixBlendMode: 'soft-light' }} />

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          className="rounded-3xl p-6 md:p-8 max-w-md w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: 'linear-gradient(180deg, hsl(192, 55%, 14%) 0%, hsl(195, 60%, 9%) 100%)', border: '1px solid hsla(45, 60%, 55%, 0.18)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}
        >
          <AnimatePresence mode="wait">
            {step === 'code' && (
              <motion.div key="code" className="space-y-5 text-center" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
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
                  className="w-full rounded-xl px-4 py-3 font-tajawal text-center focus:outline-none tracking-[0.4em] text-2xl uppercase"
                  style={{ backgroundColor: 'hsla(195, 60%, 12%, 0.7)', border: '1px solid hsla(45, 60%, 55%, 0.3)', color: 'hsl(40, 100%, 95%)' }}
                  dir="ltr"
                  maxLength={8}
                />
                <p className="text-cream/40 text-xs font-tajawal">8 أحرف وأرقام</p>
                <motion.button
                  className="w-full py-4 rounded-xl font-tajawal font-bold text-xl text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(45, 90%, 55%), hsl(38, 88%, 42%))', color: 'hsl(195, 60%, 8%)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => validateRoomCode(roomCode)}
                  disabled={codeLoading || !roomCode.trim()}
                >
                  {codeLoading ? 'جاري التحقق...' : 'دخول'}
                </motion.button>
                {error && <p className="text-red-400 font-tajawal text-sm">{error}</p>}
              </motion.div>
            )}

            {step === 'team' && (
              <motion.div key="team" className="space-y-6 text-center" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-2xl font-tajawal font-[900] text-cream">اختر فريقك</h2>
                <p className="text-cream/50 font-tajawal text-sm">رمز الغرفة: {roomData?.room_code}</p>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    className="py-8 rounded-2xl font-tajawal font-bold text-xl text-white"
                    style={{ background: `linear-gradient(135deg, ${teamColorHex('team1')}, hsl(20, 80%, 42%))`, border: '1px solid hsla(45, 60%, 55%, 0.4)' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTeamSelect('team1')}
                  >
                    {teamName('team1')}
                  </motion.button>
                  <motion.button
                    className="py-8 rounded-2xl font-tajawal font-bold text-xl text-white"
                    style={{ background: `linear-gradient(135deg, ${teamColorHex('team2')}, hsl(222, 75%, 32%))`, border: '1px solid hsla(45, 60%, 55%, 0.4)' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTeamSelect('team2')}
                  >
                    {teamName('team2')}
                  </motion.button>
                </div>
                {error && <p className="text-red-400 font-tajawal text-sm">{error}</p>}
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div key="details" className="space-y-5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div className="text-center">
                  <h2 className="text-2xl font-tajawal font-[900] text-cream mb-2">انضم إلى</h2>
                  <div className="inline-block px-4 py-1.5 rounded-full font-tajawal font-bold text-sm"
                    style={{ background: `${teamColorHex(selectedTeam)}25`, color: teamColorHex(selectedTeam), border: `1px solid ${teamColorHex(selectedTeam)}55` }}>
                    {teamName(selectedTeam)}
                  </div>
                </div>

                <input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="اسمك"
                  className="w-full rounded-xl px-4 py-3 font-tajawal text-center focus:outline-none"
                  style={{ backgroundColor: 'hsla(195, 60%, 12%, 0.7)', border: '1px solid hsla(45, 60%, 55%, 0.25)', color: 'hsl(40, 100%, 95%)' }}
                />

                <div>
                  <p className="text-cream/70 font-tajawal text-sm mb-3 text-center">اختر صورتك</p>

                  {/* Preview */}
                  <div className="flex justify-center mb-4">
                    <Avatar value={avatar} size={84} />
                  </div>

                  {/* Icon grid */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {AVATAR_ICONS.map(({ key, Comp, label }) => {
                      const value = `${ICON_PREFIX}${key}`;
                      const active = avatar === value;
                      return (
                        <button
                          key={key}
                          onClick={() => setAvatar(value)}
                          title={label}
                          className="aspect-square rounded-full flex items-center justify-center transition-all"
                          style={{
                            background: active
                              ? 'linear-gradient(135deg, hsla(45, 90%, 55%, 0.2), hsla(195, 60%, 12%, 0.7))'
                              : 'hsla(195, 60%, 12%, 0.6)',
                            border: active ? '2px solid hsl(45, 90%, 55%)' : '1px solid hsla(0, 0%, 100%, 0.08)',
                            color: active ? 'hsl(45, 92%, 65%)' : 'hsl(40, 100%, 80%)',
                            boxShadow: active ? '0 0 14px hsla(45, 90%, 55%, 0.5)' : 'none',
                            transform: active ? 'scale(1.05)' : 'scale(1)',
                          }}
                        >
                          <Comp width={28} height={28} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Upload */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full py-2.5 rounded-xl font-tajawal text-sm transition-all disabled:opacity-50"
                    style={{
                      background: 'hsla(195, 60%, 12%, 0.7)',
                      border: '1px dashed hsla(45, 60%, 55%, 0.4)',
                      color: 'hsl(45, 92%, 65%)',
                    }}
                  >
                    {uploading ? 'جاري الرفع...' : '⬆ ارفع صورتك الخاصة'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                  />
                </div>

                <motion.button
                  className="w-full py-4 rounded-xl font-tajawal font-bold text-xl"
                  style={{ background: 'linear-gradient(135deg, hsl(45, 90%, 55%), hsl(38, 88%, 42%))', color: 'hsl(195, 60%, 8%)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleJoin}
                  disabled={!playerName.trim() || uploading}
                >
                  انضم للعبة
                </motion.button>
                {error && <p className="text-red-400 font-tajawal text-sm text-center">{error}</p>}
              </motion.div>
            )}

            {step === 'waiting' && (
              <motion.div key="waiting" className="text-center space-y-5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className="inline-block"
                >
                  <Avatar value={avatar} size={96} />
                </motion.div>
                <h2 className="text-2xl font-tajawal font-[900] text-cream">مرحباً {playerName}!</h2>
                <div className="inline-block px-4 py-2 rounded-full font-tajawal font-bold"
                  style={{ background: `${teamColorHex(selectedTeam)}25`, color: teamColorHex(selectedTeam), border: `1px solid ${teamColorHex(selectedTeam)}55` }}>
                  {teamName(selectedTeam)}
                </div>
                <motion.p
                  className="text-cream/50 font-tajawal text-base"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  في انتظار بدء اللعبة من المضيف...
                </motion.p>

                <div className="space-y-3 mt-4">
                  <p className="text-cream/60 font-tajawal text-sm">اللاعبون المتصلون ({connectedPlayers.length})</p>
                  {[{ list: team1Players, team: 'team1' as const }, { list: team2Players, team: 'team2' as const }].map(({ list, team }) => (
                    list.length > 0 && (
                      <div key={team}>
                        <p className="text-xs font-tajawal font-bold mb-1.5" style={{ color: teamColorHex(team) }}>{teamName(team)}</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {list.map((p, i) => (
                            <motion.div
                              key={p.id}
                              className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl"
                              style={{ background: `${teamColorHex(team)}12`, border: `1px solid ${teamColorHex(team)}30` }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.08 }}
                            >
                              <Avatar value={p.avatar_url || `${ICON_PREFIX}crown`} size={32} />
                              <span className="text-cream/80 text-[11px] font-tajawal">{p.name}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
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
