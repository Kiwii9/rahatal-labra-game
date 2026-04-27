// ============================
// TVView: Read-only spectator screen for casting to a TV.
// - No DB writes, no buzzer, no controls.
// - Mirrors the live board + currently-shown question card.
// - Reached from the player join screen (audience option).
// ============================
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import HexBoard from "@/components/game/HexBoard";
import ScorePanel from "@/components/game/ScorePanel";
import GameTitle from "@/components/game/GameTitle";
import { supabase } from "@/integrations/supabase/client";
import { resolveQuestion, type ResolvedQuestion } from "@/lib/questionResolver";
import type { HexCell } from "@/lib/gameLogic";

const TVView = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room") || "";

  const [roomRow, setRoomRow] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) { setLoading(false); return; }
    let cancelled = false;
    supabase.from('rooms').select('*').eq('id', roomId).maybeSingle().then(({ data }) => {
      if (cancelled) return;
      setRoomRow(data); setLoading(false);
    });
    supabase.from('players').select('*').eq('room_id', roomId).then(({ data }) => {
      if (data && !cancelled) setPlayers(data);
    });
    const ch = supabase.channel(`tv-room-${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (p) => setRoomRow(p.new))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
        supabase.from('players').select('*').eq('room_id', roomId).then(({ data }) => {
          if (data) setPlayers(data);
        });
      })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [roomId]);

  // Sanitized board (golden flag stripped — same as guests)
  const board: HexCell[] = useMemo(() => {
    const raw: HexCell[] = (roomRow?.board as any) || [];
    return raw.map(c => ({ ...c, isGolden: false }));
  }, [roomRow?.board]);

  const team1Name = roomRow?.team1_name || 'الفريق الأول';
  const team2Name = roomRow?.team2_name || 'الفريق الثاني';
  const team1Color: 'terracotta' | 'blue' = (roomRow?.team1_color as any) || 'terracotta';
  const team2Color: 'terracotta' | 'blue' = (roomRow?.team2_color as any) || 'blue';
  const team1Score = roomRow?.team1_score ?? 0;
  const team2Score = roomRow?.team2_score ?? 0;
  const currentTurn: 'team1' | 'team2' = (roomRow?.current_turn as any) || 'team1';

  // Currently-shown question (driven entirely by host writes to the room)
  const activeQuestion: { cell: HexCell; q: ResolvedQuestion } | null = useMemo(() => {
    const idx = roomRow?.current_hex_index;
    if (idx === null || idx === undefined) return null;
    const cell = ((roomRow?.board as HexCell[]) || []).find(c => c.index === idx);
    if (!cell) return null;
    const q = resolveQuestion(cell.letter, roomRow, roomRow?.current_question_idx);
    return { cell, q };
  }, [roomRow]);

  const answerRevealed = !!roomRow?.answer_revealed;

  // QR back to /join (so audience members can grab a player seat)
  const joinUrl = roomRow?.room_code
    ? `${window.location.origin}/join?code=${roomRow.room_code}`
    : '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a3644' }}>
        <p className="text-cream/60 font-tajawal text-2xl">جاري تجهيز شاشة العرض...</p>
      </div>
    );
  }

  if (!roomRow) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a3644' }}>
        <p className="text-cream/70 font-tajawal text-2xl">لم يتم العثور على الغرفة</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#1a3644' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'url(/patterns/tribal-pattern.webp)', backgroundSize: '400px', opacity: 0.06, mixBlendMode: 'soft-light' }} />

      {/* Header */}
      <div className="pt-6 pb-2 relative z-10">
        <GameTitle hostName={roomRow.host_name || 'رحّال'} className="scale-100 md:scale-110" />
      </div>

      {/* Main stage */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-4 relative z-10">
        <div className="flex flex-row items-center justify-center gap-8 lg:gap-16 w-full max-w-7xl">
          <div className="scale-110 lg:scale-125">
            <ScorePanel teamName={team2Name} score={team2Score} teamColor={team2Color} isActive={currentTurn === 'team2'} />
          </div>

          <div className="w-full max-w-[720px] lg:max-w-[820px]">
            <HexBoard
              board={board}
              currentTurn={currentTurn}
              team1Color={team1Color} team2Color={team2Color}
              onHexClick={() => { /* read-only */ }}
              disabled={true}
              players={players}
              team1Name={team1Name}
              team2Name={team2Name}
            />
          </div>

          <div className="scale-110 lg:scale-125">
            <ScorePanel teamName={team1Name} score={team1Score} teamColor={team1Color} isActive={currentTurn === 'team1'} />
          </div>
        </div>
      </div>

      {/* Footer: small QR pointing back to join */}
      <div className="px-6 pb-4 flex items-end justify-between text-cream/60 font-tajawal relative z-10">
        <div className="text-sm">
          اللعبة من إدارة <span className="text-cream/90 font-bold">{roomRow.host_name || 'رحّال'}</span>
        </div>
        {joinUrl && (
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <p>للانضمام كلاعب</p>
              <p dir="ltr" className="font-mono tracking-widest text-cream/80">{roomRow.room_code}</p>
            </div>
            <div className="bg-white p-1.5 rounded-md">
              <QRCodeSVG value={joinUrl} size={64} />
            </div>
          </div>
        )}
      </div>

      {/* Active question fullscreen card */}
      <AnimatePresence>
        {activeQuestion && (
          <motion.div
            key={`q-${activeQuestion.cell.index}`}
            className="fixed inset-0 z-30 flex items-center justify-center p-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: 'rgba(15, 35, 45, 0.92)', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              className="rounded-3xl p-8 lg:p-12 max-w-5xl w-full text-center"
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{
                background: 'linear-gradient(180deg, hsl(192, 55%, 14%) 0%, hsl(195, 60%, 9%) 100%)',
                border: '2px solid hsla(45, 90%, 55%, 0.45)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 60px hsla(45, 90%, 55%, 0.2)',
              }}
            >
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-7xl lg:text-8xl font-tajawal font-[900]" style={{ color: 'hsl(45, 92%, 65%)' }}>
                  {activeQuestion.cell.letter}
                </div>
                <div className="px-4 py-2 rounded-full text-base lg:text-lg font-tajawal font-bold"
                  style={{ background: 'hsla(45, 90%, 55%, 0.15)', color: 'hsl(45, 92%, 70%)', border: '1px solid hsla(45, 90%, 55%, 0.4)' }}>
                  {activeQuestion.q.category}
                </div>
              </div>

              {activeQuestion.q.imageUrl && (
                <img src={activeQuestion.q.imageUrl} alt="" className="max-h-[40vh] mx-auto mb-6 rounded-2xl object-contain"
                  style={{ border: '1px solid hsla(45, 60%, 55%, 0.3)' }} />
              )}
              {activeQuestion.q.videoUrl && (
                <video src={activeQuestion.q.videoUrl} controls className="max-h-[40vh] mx-auto mb-6 rounded-2xl" />
              )}

              <p className="text-cream font-tajawal font-bold text-3xl lg:text-5xl leading-snug mb-6">
                {activeQuestion.q.question}
              </p>

              {answerRevealed && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 px-6 py-4 rounded-2xl inline-block"
                  style={{ background: 'hsla(45, 90%, 55%, 0.12)', border: '1px solid hsla(45, 90%, 55%, 0.45)' }}
                >
                  <p className="text-cream/60 font-tajawal text-sm mb-1">الإجابة</p>
                  <p className="font-tajawal font-[900] text-2xl lg:text-3xl" style={{ color: 'hsl(45, 92%, 70%)' }}>
                    {activeQuestion.q.answer}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TVView;
