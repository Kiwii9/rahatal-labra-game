// ============================
// Lobby: Host setup — "Dark & Royal" 3-column game master control
// - Grid-size cards (7x7 / 6x6 / 5x5) UI-only for now
// - Right col: Team 1 (orange swatches) | Middle col: Team 2 (blue swatches) | Left col: rules pills
// - Bottom: prominent "إنشاء اللعبة" CTA
// ============================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useRoom } from "@/hooks/useRoom";
import GameTitle from "@/components/game/GameTitle";
import GameFooter from "@/components/game/GameFooter";

type GridSize = 7 | 6 | 5;
type TeamColorKey = 'terracotta' | 'blue';

// Hex swatch palettes (only terracotta + blue currently map to game logic; others are decorative for now)
const ORANGE_SWATCHES = [
  { key: 'terracotta', hex: '#f28b44', label: 'برتقالي' },
  { key: 'amber', hex: '#e07030', label: 'كهرماني' },
  { key: 'crimson', hex: '#c13a2a', label: 'قرمزي' },
  { key: 'gold', hex: '#d4a85a', label: 'ذهبي' },
] as const;
const BLUE_SWATCHES = [
  { key: 'blue', hex: '#4a80e8', label: 'أزرق ملكي' },
  { key: 'navy', hex: '#1f3d8a', label: 'كحلي' },
  { key: 'teal', hex: '#1d6f7a', label: 'طاووسي' },
  { key: 'violet', hex: '#6b4ad8', label: 'بنفسجي' },
] as const;

// Mini hex visualization for grid-size cards
const MiniGrid = ({ n }: { n: number }) => {
  const size = 6;
  const w = Math.sqrt(3) * size;
  const h = 2 * size * 0.75;
  const cells: JSX.Element[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const cx = c * w + (r % 2) * (w / 2) + size;
      const cy = r * h + size;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 180) * (60 * i - 30);
        return `${cx + size * Math.cos(a)},${cy + size * Math.sin(a)}`;
      }).join(' ');
      cells.push(<polygon key={`${r}-${c}`} points={pts} fill="hsl(192, 50%, 35%)" stroke="hsl(195, 60%, 12%)" strokeWidth="0.6" />);
    }
  }
  const W = n * w + w;
  const H = n * h + size * 2;
  return <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">{cells}</svg>;
};

const Lobby = () => {
  const navigate = useNavigate();
  const { room, players, loading, createRoom, updateRoom } = useRoom();

  const [hostName, setHostName] = useState("رحّال");
  const [gridSize, setGridSize] = useState<GridSize>(5);
  const [team1Name, setTeam1Name] = useState("الفريق الأول");
  const [team2Name, setTeam2Name] = useState("الفريق الثاني");
  const [team1Swatch, setTeam1Swatch] = useState<string>('terracotta');
  const [team2Swatch, setTeam2Swatch] = useState<string>('blue');
  const [timeLimit, setTimeLimit] = useState<number | null>(null); // null = ∞
  const [rounds, setRounds] = useState<number>(1);
  const [starter, setStarter] = useState<'team1' | 'team2' | 'random'>('random');
  const [initialized, setInitialized] = useState(false);

  // Map decorative swatches → engine team colors (only terracotta/blue understood by game logic)
  const team1EngineColor: TeamColorKey = team1Swatch === 'blue' || team1Swatch === 'navy' || team1Swatch === 'teal' || team1Swatch === 'violet' ? 'blue' : 'terracotta';
  const team2EngineColor: TeamColorKey = team2Swatch === 'terracotta' || team2Swatch === 'amber' || team2Swatch === 'crimson' || team2Swatch === 'gold' ? 'terracotta' : 'blue';

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      createRoom(hostName);
    }
  }, [initialized, createRoom, hostName]);

  const guestJoinUrl = room?.room_code ? `${window.location.origin}/join?code=${room.room_code}` : '';
  const hostControllerUrl = room ? `${window.location.origin}/host-controller?room=${room.id}` : '';

  const startGame = async () => {
    if (!room) return;
    await updateRoom({
      status: 'playing',
      host_name: hostName,
      team1_name: team1Name,
      team2_name: team2Name,
      team1_color: team1EngineColor,
      team2_color: team2EngineColor,
    } as any);

    const params = new URLSearchParams({
      role: 'host',
      room: room.id,
      t1: team1Name,
      t2: team2Name,
      t1c: team1EngineColor,
      t2c: team2EngineColor,
      host: hostName,
      grid: String(gridSize),
      time: timeLimit === null ? 'inf' : String(timeLimit),
      rounds: String(rounds),
      starter,
    });
    navigate(`/game?${params.toString()}`);
  };

  // Royal palette helpers
  const cardBg = 'linear-gradient(180deg, hsl(192, 55%, 14%) 0%, hsl(195, 60%, 9%) 100%)';
  const cardBorder = '1px solid hsla(45, 60%, 55%, 0.18)';
  const goldGlow = '0 0 0 2px hsl(45, 90%, 55%), 0 0 20px hsla(45, 90%, 55%, 0.5)';

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: 'hsl(195, 60%, 8%)' }}>
      {/* Subtle royal pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'url(/patterns/tribal-pattern.webp)', backgroundSize: '300px', opacity: 0.05, mixBlendMode: 'soft-light' }} />

      <div className="flex-1 flex items-start justify-center p-4 md:p-6 relative z-10 overflow-y-auto">
        <motion.div
          className="rounded-3xl p-5 md:p-8 max-w-6xl w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: cardBg, border: cardBorder, boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}
        >
              {/* Title + Home button */}
              <div className="mb-4 relative">
                <button
                  onClick={() => navigate('/')}
                  className="absolute top-0 right-0 z-10 px-3 py-2 rounded-xl font-tajawal text-xs font-bold transition-all"
                  style={{
                    background: 'hsla(195, 60%, 12%, 0.8)',
                    color: 'hsl(45, 92%, 65%)',
                    border: '1px solid hsla(45, 90%, 55%, 0.4)',
                  }}
                  title="العودة للرئيسية"
                >
                  🏠 الرئيسية
                </button>
                <div className="text-center">
                  <GameTitle hostName={hostName} className="scale-75 origin-center" />
                </div>
              </div>

          {loading && !room && (
            <div className="text-center py-10">
              <motion.p className="text-cream/60 font-tajawal" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                جاري إنشاء الغرفة الملكية...
              </motion.p>
            </div>
          )}

          {room && (
            <div className="space-y-6">
              {/* Room code + QR strip */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center rounded-2xl p-4" style={{ background: 'hsla(192, 55%, 18%, 0.5)', border: '1px solid hsla(45, 60%, 55%, 0.15)' }}>
                <div className="text-center md:text-right">
                  <p className="text-cream/60 text-xs font-tajawal mb-1">🔑 رمز الغرفة</p>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <code
                      className="text-3xl font-tajawal font-[900] tracking-[0.3em] px-4 py-2 rounded-xl"
                      style={{ color: 'hsl(45, 92%, 60%)', backgroundColor: 'hsla(45, 92%, 55%, 0.08)', border: '1px solid hsla(45, 92%, 55%, 0.3)' }}
                      dir="ltr"
                    >
                      {(room as any).room_code || '...'}
                    </code>
                    <button
                      onClick={() => (room as any).room_code && navigator.clipboard.writeText((room as any).room_code)}
                      className="px-3 py-2 rounded-xl font-tajawal text-sm text-white"
                      style={{ background: 'linear-gradient(135deg, hsl(45, 92%, 50%), hsl(38, 88%, 42%))' }}
                    >
                      نسخ
                    </button>
                  </div>
                  <p className="text-cream/40 text-xs font-tajawal mt-1" dir="ltr">{guestJoinUrl}</p>
                </div>
                <div className="text-center">
                  <div className="inline-block bg-white p-2 rounded-xl">
                    <QRCodeSVG value={hostControllerUrl} size={84} />
                  </div>
                  <p className="text-cream/40 text-[10px] font-tajawal mt-1">تحكم الموبايل</p>
                </div>
              </div>

              {/* SECTION 1 — Grid Size */}
              <div>
                <h3 className="text-cream/80 font-tajawal font-bold text-lg mb-3 text-center">حجم اللوحة</h3>
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  {([7, 6, 5] as GridSize[]).map((n) => {
                    const active = gridSize === n;
                    return (
                      <motion.button
                        key={n}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setGridSize(n)}
                        className="rounded-2xl p-3 md:p-4 text-center transition-all"
                        style={{
                          background: active
                            ? 'linear-gradient(180deg, hsla(45, 90%, 55%, 0.18) 0%, hsla(192, 55%, 14%, 0.9) 100%)'
                            : 'hsla(192, 55%, 18%, 0.5)',
                          border: active ? '2px solid hsl(45, 90%, 55%)' : '1px solid hsla(0, 0%, 100%, 0.08)',
                          boxShadow: active ? goldGlow : 'none',
                        }}
                      >
                        <div className="opacity-90"><MiniGrid n={n} /></div>
                        <p className="font-tajawal font-[900] mt-2 text-base md:text-lg" style={{ color: active ? 'hsl(45, 92%, 65%)' : 'hsl(40, 100%, 95%)' }}>
                          {n}×{n}
                        </p>
                        {n !== 5 && (
                          <p className="text-cream/40 text-[10px] font-tajawal mt-0.5">قريبًا</p>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Host name */}
              <div className="max-w-md mx-auto w-full">
                <label className="text-cream/60 text-sm font-tajawal block mb-1 text-center">اسم المضيف</label>
                <input
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 font-tajawal focus:outline-none text-center"
                  style={{ backgroundColor: 'hsla(195, 60%, 12%, 0.7)', border: '1px solid hsla(45, 60%, 55%, 0.25)', color: 'hsl(40, 100%, 95%)' }}
                />
              </div>

              {/* SECTION 2 — 3 columns. RTL: visually right=team1, center=team2, left=rules */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Team 1 (right in RTL) */}
                <TeamCard
                  title="الفريق الأول"
                  name={team1Name}
                  onName={setTeam1Name}
                  swatches={ORANGE_SWATCHES as any}
                  selected={team1Swatch}
                  onSelect={setTeam1Swatch}
                  players={players.filter(p => p.team === 'team1')}
                />

                {/* Team 2 */}
                <TeamCard
                  title="الفريق الثاني"
                  name={team2Name}
                  onName={setTeam2Name}
                  swatches={BLUE_SWATCHES as any}
                  selected={team2Swatch}
                  onSelect={setTeam2Swatch}
                  players={players.filter(p => p.team === 'team2')}
                />

                {/* Game Rules (left in RTL) */}
                <div className="rounded-2xl p-4" style={{ background: 'hsla(192, 55%, 14%, 0.7)', border: cardBorder }}>
                  <h4 className="text-cream/80 font-tajawal font-bold text-base mb-3 text-center">قواعد اللعبة</h4>

                  <p className="text-cream/60 text-xs font-tajawal mb-1.5">⏱ الزمن</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {[null, 30, 45, 60].map((t) => (
                      <Pill key={String(t)} active={timeLimit === t} onClick={() => setTimeLimit(t)}>
                        {t === null ? '∞' : `${t}s`}
                      </Pill>
                    ))}
                  </div>

                  <p className="text-cream/60 text-xs font-tajawal mb-1.5">🎯 عدد الجولات</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {[1, 3, 5].map((r) => (
                      <Pill key={r} active={rounds === r} onClick={() => setRounds(r)}>{r}</Pill>
                    ))}
                  </div>

                  <p className="text-cream/60 text-xs font-tajawal mb-1.5">🚀 البادئ</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Pill active={starter === 'team1'} onClick={() => setStarter('team1')}>الأول</Pill>
                    <Pill active={starter === 'team2'} onClick={() => setStarter('team2')}>الثاني</Pill>
                    <Pill active={starter === 'random'} onClick={() => setStarter('random')}>عشوائي</Pill>
                  </div>
                </div>
              </div>

              {/* Player count */}
              <div className="text-center text-cream/50 font-tajawal text-sm">
                {players.length} لاعب متصل
              </div>

              {/* CTA */}
              <motion.button
                className="w-full max-w-md mx-auto block py-4 rounded-2xl font-tajawal font-[900] text-2xl text-white"
                style={{
                  background: 'linear-gradient(135deg, hsl(25, 87%, 58%) 0%, hsl(20, 80%, 42%) 100%)',
                  boxShadow: '0 0 30px hsla(25, 87%, 58%, 0.45), 0 0 0 2px hsla(45, 90%, 55%, 0.4) inset',
                  border: '1px solid hsla(45, 90%, 55%, 0.5)',
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 50px hsla(25, 87%, 58%, 0.7), 0 0 0 2px hsla(45, 90%, 55%, 0.6) inset' }}
                whileTap={{ scale: 0.97 }}
                onClick={startGame}
              >
                إنشاء اللعبة
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      <GameFooter />
    </div>
  );
};

// --- Sub-components ---

const Pill = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-full font-tajawal text-xs font-bold transition-all"
    style={{
      background: active ? 'linear-gradient(135deg, hsl(45, 90%, 55%), hsl(38, 88%, 42%))' : 'hsla(195, 60%, 12%, 0.6)',
      color: active ? 'hsl(195, 60%, 8%)' : 'hsl(40, 100%, 95%)',
      border: active ? '1px solid hsl(45, 90%, 60%)' : '1px solid hsla(0, 0%, 100%, 0.1)',
      boxShadow: active ? '0 0 15px hsla(45, 90%, 55%, 0.5)' : 'none',
    }}
  >
    {children}
  </button>
);

interface TeamCardProps {
  title: string;
  name: string;
  onName: (v: string) => void;
  swatches: ReadonlyArray<{ key: string; hex: string; label: string }>;
  selected: string;
  onSelect: (key: string) => void;
  players: any[];
}
const TeamCard = ({ title, name, onName, swatches, selected, onSelect, players }: TeamCardProps) => {
  const selectedHex = swatches.find(s => s.key === selected)?.hex || swatches[0].hex;
  return (
    <div className="rounded-2xl p-4" style={{ background: 'hsla(192, 55%, 14%, 0.7)', border: '1px solid hsla(45, 60%, 55%, 0.18)' }}>
      <h4 className="text-cream/80 font-tajawal font-bold text-base mb-3 text-center" style={{ color: selectedHex }}>{title}</h4>
      <input
        value={name}
        onChange={(e) => onName(e.target.value)}
        placeholder="اسم الفريق"
        className="w-full rounded-xl px-3 py-2.5 font-tajawal text-sm focus:outline-none mb-3 text-center"
        style={{ backgroundColor: 'hsla(195, 60%, 12%, 0.7)', border: `1px solid ${selectedHex}55`, color: 'hsl(40, 100%, 95%)' }}
      />

      <p className="text-cream/55 text-[11px] font-tajawal mb-2 text-center">اللون</p>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {swatches.map((sw) => {
          const active = selected === sw.key;
          return (
            <button
              key={sw.key}
              onClick={() => onSelect(sw.key)}
              title={sw.label}
              className="w-9 h-9 mx-auto rounded-full transition-all"
              style={{
                background: sw.hex,
                boxShadow: active
                  ? `0 0 0 2px hsl(45, 90%, 55%), 0 0 14px ${sw.hex}aa`
                  : `0 2px 6px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.3)`,
                transform: active ? 'scale(1.12)' : 'scale(1)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            />
          );
        })}
      </div>

      {players.length > 0 && (
        <div className="space-y-1 mt-2 max-h-24 overflow-y-auto">
          {players.map((p) => (
            <div key={p.id} className="text-cream/75 text-xs font-tajawal flex items-center gap-2 px-2 py-1 rounded-md" style={{ background: 'hsla(195, 60%, 12%, 0.5)' }}>
              {p.avatar_url?.startsWith('http') || p.avatar_url?.startsWith('data:')
                ? <img src={p.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                : <span>{p.avatar_url || '👤'}</span>}
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Lobby;
