// ============================
// Game: Live game stage with one-time start modal & golden question win support
// - Board state lives in DB (rooms.board) so host & guests stay in perfect sync
// - Guests get a sanitized board (golden flag stripped)
// ============================
import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import HexBoard from "@/components/game/HexBoard";
import ScorePanel from "@/components/game/ScorePanel";
import QuestionModal from "@/components/game/QuestionModal";
import PreQuestionModal from "@/components/game/PreQuestionModal";
import GameTitle from "@/components/game/GameTitle";
import WinnerOverlay from "@/components/game/WinnerOverlay";
import GameFooter from "@/components/game/GameFooter";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { supabase } from "@/integrations/supabase/client";
import {
  generateBoard,
  checkWin,
  type HexCell,
} from "@/lib/gameLogic";
import { resolveQuestion, type ResolvedQuestion } from "@/lib/questionResolver";

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sfx = useSoundEffects();

  const isHost = searchParams.get("role") === "host";
  const roomId = searchParams.get("room") || "";
  const team1Name = searchParams.get("t1") || "الفريق الأول";
  const team2Name = searchParams.get("t2") || "الفريق الثاني";
  const team1Color = (searchParams.get("t1c") as 'terracotta' | 'blue') || "terracotta";
  const team2Color = (searchParams.get("t2c") as 'terracotta' | 'blue') || "blue";
  const hostName = searchParams.get("host") || "رحّال";
  const timeParam = searchParams.get("time");
  const perQuestionTime: number | null = !timeParam || timeParam === 'inf' ? null : (parseInt(timeParam, 10) || null);

  // Live room snapshot from DB (the single source of truth for board + scores)
  const [roomRow, setRoomRow] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCell, setSelectedCell] = useState<HexCell | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<ResolvedQuestion | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [showGameStartModal, setShowGameStartModal] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<'team1' | 'team2' | null>(null);

  // Initial fetch + subscribe to room/players updates
  useEffect(() => {
    if (!roomId) { setLoading(false); return; }
    let cancelled = false;

    const ensureBoard = async () => {
      const { data } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();
      if (cancelled) return;
      if (!data) { setLoading(false); return; }
      let row: any = data;
      // Host guarantees a board exists. Guests just consume what's there.
      if (isHost && (!row.board || !Array.isArray(row.board) || row.board.length === 0)) {
        const board = generateBoard();
        const { data: updated } = await supabase
          .from('rooms')
          .update({ board: board as any } as any)
          .eq('id', roomId)
          .select()
          .single();
        if (updated) row = updated;
      }
      setRoomRow(row);
      setLoading(false);
    };
    ensureBoard();

    const ch = supabase.channel(`game-room-${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => setRoomRow(payload.new))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
        supabase.from('players').select('*').eq('room_id', roomId).then(({ data }) => {
          if (data) setPlayers(data);
        });
      })
      .subscribe();

    supabase.from('players').select('*').eq('room_id', roomId).then(({ data }) => {
      if (data) setPlayers(data);
    });

    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [roomId, isHost]);

  // Sanitize board for guests: hide isGolden flag entirely so the visual gold tile never appears for them.
  const board: HexCell[] = useMemo(() => {
    const raw: HexCell[] = (roomRow?.board as any) || [];
    if (isHost) return raw;
    return raw.map((c) => ({ ...c, isGolden: false }));
  }, [roomRow?.board, isHost]);

  const team1Score = roomRow?.team1_score ?? 0;
  const team2Score = roomRow?.team2_score ?? 0;
  const currentTurn = (roomRow?.current_turn as 'team1' | 'team2') || 'team1';
  const currentTurnColor = currentTurn === 'team1' ? team1Color : team2Color;

  // Dismiss the one-time game start modal
  const handleGameStart = useCallback(() => {
    setShowGameStartModal(false);
    setGameStarted(true);
  }, []);

  // Click hex → show question directly (no per-question interceptor)
  const handleHexClick = useCallback((cell: HexCell) => {
    if (!isHost || cell.status !== 'unclaimed' || winner || !gameStarted) return;
    sfx.playHexSelect();

    // Use the AUTHORITATIVE board (host's view) to know if cell is golden
    const authoritative = (roomRow?.board as HexCell[] | undefined)?.find(c => c.index === cell.index);
    if (authoritative?.isGolden) {
      sfx.playGolden();
      setSelectedCell(authoritative);
      setCurrentQuestion({
        question: 'سؤال ذهبي! نقطة مجانية لأحد الفريقين',
        answer: 'اختر الفريق الذي يحصل على النقطة',
        category: 'سؤال ذهبي',
      });
      setAnswerRevealed(true);
      return;
    }

    const q = resolveQuestion(cell.letter, roomRow);
    setSelectedCell(cell);
    setCurrentQuestion(q);
    setAnswerRevealed(false);
    setTimeout(() => sfx.playQuestionReveal(), 300);
  }, [isHost, winner, gameStarted, sfx, roomRow?.board]);

  const awardHex = useCallback(async (team: 'team1' | 'team2') => {
    if (!selectedCell || !roomRow) return;
    sfx.playCorrect();

    const newBoard = ((roomRow.board as HexCell[]) || []).map((c) =>
      c.index === selectedCell.index ? { ...c, status: team } : c
    );
    const winPath = checkWin(newBoard, team);
    const hasWinner = winPath !== null;
    const finalBoard = hasWinner
      ? newBoard.map((c) => ({ ...c, isWinningPath: winPath!.includes(c.index) }))
      : newBoard;

    const newTeam1Score = team === 'team1' ? team1Score + 1 : team1Score;
    const newTeam2Score = team === 'team2' ? team2Score + 1 : team2Score;

    if (hasWinner) {
      setTimeout(() => sfx.playWin(), 500);
      setWinner(team);
    }

    await supabase.from('rooms').update({
      board: finalBoard as any,
      team1_score: newTeam1Score,
      team2_score: newTeam2Score,
    } as any).eq('id', roomRow.id);

    setSelectedCell(null);
    setCurrentQuestion(null);
  }, [selectedCell, roomRow, team1Score, team2Score, sfx]);

  const handleWrong = useCallback(() => {
    sfx.playWrong();
    setSelectedCell(null);
    setCurrentQuestion(null);
  }, [sfx]);

  const playAgain = useCallback(async () => {
    if (!roomRow) return;
    const fresh = generateBoard();
    setWinner(null);
    await supabase.from('rooms').update({
      board: fresh as any,
      team1_score: 0,
      team2_score: 0,
      current_turn: 'team1',
    } as any).eq('id', roomRow.id);
  }, [roomRow]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a3644' }}>
        <p className="text-cream/60 font-tajawal">جاري تحميل اللعبة...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: '#1a3644' }}>
      {/* Header */}
      <div className="pt-4 pb-2 px-4 relative">
        {isHost && (
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 z-20 px-3 py-2 rounded-xl font-tajawal text-xs font-bold transition-all hover:scale-105"
            style={{
              background: 'rgba(26,54,68,0.85)',
              color: '#f6c761',
              border: '1px solid rgba(246,199,97,0.4)',
              backdropFilter: 'blur(6px)',
            }}
            title="العودة للرئيسية"
          >
            🏠 الرئيسية
          </button>
        )}
        <GameTitle hostName={hostName} className="scale-90 md:scale-100" />
      </div>

      {/* Game area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-2 md:px-4 py-2 md:py-4">
        {/* Score panels + Board */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 w-full max-w-5xl">
          {/* Team 2 score (right side in RTL) */}
          <div className="order-1 md:order-1">
            <ScorePanel teamName={team2Name} score={team2Score} teamColor={team2Color} isActive={currentTurn === 'team2'} />
          </div>

          {/* Board */}
          <div className="order-2 md:order-2 w-full max-w-[600px] md:max-w-[700px]">
            <HexBoard
              board={board}
              currentTurn={currentTurn}
              team1Color={team1Color} team2Color={team2Color}
              onHexClick={handleHexClick} disabled={!isHost || !!winner}
              players={players}
              team1Name={team1Name}
              team2Name={team2Name}
            />
          </div>

          {/* Team 1 score (left side in RTL) */}
          <div className="order-3 md:order-3">
            <ScorePanel teamName={team1Name} score={team1Score} teamColor={team1Color} isActive={currentTurn === 'team1'} />
          </div>
        </div>

        {/* Status indicator */}
        {!winner && (
          <motion.div
            className="text-center py-2 font-tajawal font-bold text-base md:text-lg text-cream/70"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isHost ? 'اختر خلية لعرض السؤال' : 'في انتظار المضيف...'}
          </motion.div>
        )}
      </div>

      {/* One-time game start modal */}
      <PreQuestionModal
        isOpen={showGameStartModal}
        onDismiss={handleGameStart}
        isGameStart={true}
      />

      {/* Actual question modal */}
      {currentQuestion && selectedCell && (
        <QuestionModal
          isOpen={true} letter={selectedCell.letter}
          question={currentQuestion.question} answer={currentQuestion.answer}
          category={currentQuestion.category} isHost={isHost}
          imageUrl={currentQuestion.imageUrl} videoUrl={currentQuestion.videoUrl}
          answerRevealed={answerRevealed} currentTurnColor={currentTurnColor}
          team1Name={team1Name} team2Name={team2Name}
          timeLimit={perQuestionTime}
          onCorrectTeam1={() => awardHex('team1')} onCorrectTeam2={() => awardHex('team2')}
          onWrong={handleWrong} onClose={() => { setSelectedCell(null); setCurrentQuestion(null); }}
        />
      )}

      {winner && (
        <WinnerOverlay
          winnerName={winner === 'team1' ? team1Name : team2Name}
          winnerColor={winner === 'team1' ? team1Color : team2Color}
          onPlayAgain={playAgain} onMainMenu={() => navigate("/")}
        />
      )}

      <GameFooter />
    </div>
  );
};

export default Game;
