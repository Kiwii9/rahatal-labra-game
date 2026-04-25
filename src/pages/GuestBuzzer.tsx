// ============================
// GuestBuzzer: Mobile buzzer view with LIVE board view
// - Shows real-time game board so players see territory updates
// - Connection overlay only during initial load (no "waiting" overlay during play)
// ============================
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useBuzzer } from "@/hooks/useBuzzer";
import HexBoard from "@/components/game/HexBoard";
import GameFooter from "@/components/game/GameFooter";
import type { HexCell } from "@/lib/gameLogic";

const GuestBuzzer = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room") || "";
  const team = (searchParams.get("team") as 'team1' | 'team2') || "team1";
  const playerName = searchParams.get("name") || "لاعب";

  const { buzzerState, buzzedTeam, lockedOutTeam, buzz } = useBuzzer(roomId, false);
  const [pressed, setPressed] = useState(false);

  // Live room snapshot
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    supabase.from('rooms').select('*').eq('id', roomId).maybeSingle().then(({ data }) => {
      if (cancelled) return;
      if (data) setRoom(data);
      setConnecting(false);
    });
    supabase.from('players').select('*').eq('room_id', roomId).then(({ data }) => {
      if (!cancelled && data) setPlayers(data);
    });
    const ch = supabase.channel(`buzzer-room-${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => setRoom(payload.new))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
        supabase.from('players').select('*').eq('room_id', roomId).then(({ data }) => {
          if (data) setPlayers(data);
        });
      })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [roomId]);

  const isMyTeamLocked = lockedOutTeam === team;
  const canBuzz = (buzzerState === 'open') ||
    (buzzerState === 'rebound' && !isMyTeamLocked) ||
    (buzzerState === 'cooldown' && !isMyTeamLocked);

  const team1Color = (room?.team1_color as 'terracotta' | 'blue') || 'terracotta';
  const team2Color = (room?.team2_color as 'terracotta' | 'blue') || 'blue';
  const myColorEngine = team === 'team1' ? team1Color : team2Color;
  const teamColorHex = myColorEngine === 'blue' ? 'hsl(222, 70%, 55%)' : 'hsl(25, 87%, 58%)';

  // Sanitize the board for guests: never reveal which cells are golden.
  const board: HexCell[] | null = room?.board
    ? (room.board as HexCell[]).map((c) => ({ ...c, isGolden: false }))
    : null;

  const handleBuzz = () => {
    if (!canBuzz) return;
    setPressed(true);
    buzz(team);
    setTimeout(() => setPressed(false), 300);
  };

  let buttonBg = 'hsl(140, 60%, 45%)';
  let buttonText = 'اضغط!';
  let statusText = 'جاهز للإجابة';

  if (buzzerState === 'idle') {
    buttonBg = 'hsl(195, 35%, 30%)';
    buttonText = 'انتظر';
    statusText = 'في انتظار السؤال';
  } else if (buzzerState === 'locked') {
    if (buzzedTeam === team) {
      buttonBg = teamColorHex;
      buttonText = 'أنت أجبت!';
      statusText = 'في انتظار حكم المضيف';
    } else {
      buttonBg = 'hsl(195, 25%, 25%)';
      buttonText = 'الفريق الآخر';
      statusText = 'الفريق المنافس أجاب أولاً';
    }
  } else if (buzzerState === 'rebound' && isMyTeamLocked) {
    buttonBg = 'hsl(0, 70%, 50%)';
    buttonText = 'محظور';
    statusText = 'دورك ممنوع - انتظر';
  } else if (buzzerState === 'cooldown' && isMyTeamLocked) {
    buttonBg = 'hsl(40, 90%, 50%)';
    buttonText = '٣ ثوانٍ...';
    statusText = 'تبريد - انتظر قليلاً';
  }

  // Initial connection overlay only
  if (connecting) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(195, 60%, 8%)' }}>
        <div className="text-center">
          <motion.div
            className="w-12 h-12 rounded-full mx-auto mb-3"
            style={{ border: '3px solid hsla(45, 90%, 55%, 0.2)', borderTopColor: 'hsl(45, 90%, 55%)' }}
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <p className="text-cream/70 font-tajawal">جاري الاتصال بالخادم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'hsl(195, 60%, 8%)' }}>
      {/* Header */}
      <div className="pt-4 pb-2 px-4 text-center">
        <p className="text-cream/60 text-sm font-tajawal">{playerName}</p>
        <div
          className="inline-block px-3 py-1 rounded-full font-tajawal font-bold text-sm mt-1"
          style={{ backgroundColor: `${teamColorHex}25`, color: teamColorHex, border: `1px solid ${teamColorHex}55` }}
        >
          {team === 'team1' ? (room?.team1_name || 'الفريق الأول') : (room?.team2_name || 'الفريق الثاني')}
        </div>
      </div>

      {/* Live mini score */}
      {room && (
        <div className="flex items-center justify-center gap-4 px-4 pb-2">
          <div className="text-center">
            <div className="text-[10px] font-tajawal text-cream/50">{room.team1_name}</div>
            <div className="text-2xl font-tajawal font-[900]" style={{ color: 'hsl(25, 87%, 58%)' }}>{room.team1_score ?? 0}</div>
          </div>
          <div className="text-cream/40 font-tajawal">—</div>
          <div className="text-center">
            <div className="text-[10px] font-tajawal text-cream/50">{room.team2_name}</div>
            <div className="text-2xl font-tajawal font-[900]" style={{ color: 'hsl(222, 70%, 55%)' }}>{room.team2_score ?? 0}</div>
          </div>
        </div>
      )}

      {/* LIVE board (always visible during play) */}
      {board && room?.status === 'playing' && (
        <div className="px-3 pb-2">
          <HexBoard
            board={board}
            currentTurn={(room.current_turn as 'team1' | 'team2') || 'team1'}
            team1Color={team1Color}
            team2Color={team2Color}
            onHexClick={() => {}}
            disabled
            players={players}
            team1Name={room?.team1_name}
            team2Name={room?.team2_name}
          />
        </div>
      )}

      {/* Buzzer button */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.button
          className="w-44 h-44 md:w-56 md:h-56 rounded-full font-tajawal font-[900] text-2xl md:text-3xl text-white select-none"
          style={{
            background: buttonBg,
            boxShadow: canBuzz
              ? `0 0 50px ${buttonBg}80, 0 8px 30px rgba(0,0,0,0.5), inset 0 -6px 16px rgba(0,0,0,0.3), 0 0 0 2px hsla(45, 90%, 55%, 0.4)`
              : `0 4px 20px rgba(0,0,0,0.5), inset 0 -4px 10px rgba(0,0,0,0.3)`,
          }}
          whileHover={canBuzz ? { scale: 1.05 } : {}}
          whileTap={canBuzz ? { scale: 0.92 } : {}}
          animate={pressed ? { scale: [1, 0.9, 1.05, 1] } : {}}
          onClick={handleBuzz}
          disabled={!canBuzz}
        >
          {buttonText}
        </motion.button>
      </div>

      <div className="pb-3 px-4 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={statusText}
            className="text-cream/60 font-tajawal text-sm"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {statusText}
          </motion.p>
        </AnimatePresence>
      </div>

      <GameFooter />
    </div>
  );
};

export default GuestBuzzer;
