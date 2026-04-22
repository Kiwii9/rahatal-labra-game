// ============================
// Game: Live game stage with one-time start modal & golden question win support
// ============================
import { useState, useCallback } from "react";
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
import {
  createInitialGameState,
  checkWin,
  getQuestionForLetter,
  type HexCell,
  type GameState,
} from "@/lib/gameLogic";

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sfx = useSoundEffects();

  const isHost = searchParams.get("role") === "host";
  const team1Name = searchParams.get("t1") || "الفريق الأول";
  const team2Name = searchParams.get("t2") || "الفريق الثاني";
  const team1Color = (searchParams.get("t1c") as 'terracotta' | 'blue') || "terracotta";
  const team2Color = (searchParams.get("t2c") as 'terracotta' | 'blue') || "blue";
  const hostName = searchParams.get("host") || "رحّال";

  const [gameState, setGameState] = useState<GameState>(() => ({
    ...createInitialGameState(),
    team1Name, team2Name, team1Color, team2Color,
  }));

  const [selectedCell, setSelectedCell] = useState<HexCell | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<{ question: string; answer: string; category: string } | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [showGameStartModal, setShowGameStartModal] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  const currentTurnColor = gameState.currentTurn === 'team1' ? team1Color : team2Color;

  // Dismiss the one-time game start modal
  const handleGameStart = useCallback(() => {
    setShowGameStartModal(false);
    setGameStarted(true);
  }, []);

  // Click hex → show question directly (no per-question interceptor)
  const handleHexClick = useCallback((cell: HexCell) => {
    if (!isHost || cell.status !== 'unclaimed' || gameState.winner || !gameStarted) return;
    sfx.playHexSelect();

    if (cell.isGolden) {
      sfx.playGolden();
      setSelectedCell(cell);
      setCurrentQuestion({
        question: 'سؤال ذهبي! نقطة مجانية لأحد الفريقين',
        answer: 'اختر الفريق الذي يحصل على النقطة',
        category: 'سؤال ذهبي',
      });
      setAnswerRevealed(true);
      return;
    }

    const q = getQuestionForLetter(cell.letter);
    setSelectedCell(cell);
    setCurrentQuestion(q);
    setAnswerRevealed(false);
    setTimeout(() => sfx.playQuestionReveal(), 300);
  }, [isHost, gameState.winner, gameStarted, sfx]);

  const awardHex = useCallback((team: 'team1' | 'team2') => {
    if (!selectedCell) return;
    sfx.playCorrect();

    setGameState(prev => {
      const newBoard = prev.board.map(c =>
        c.index === selectedCell.index ? { ...c, status: team } : c
      );
      const winPath = checkWin(newBoard, team);
      const hasWinner = winPath !== null;
      const finalBoard = hasWinner
        ? newBoard.map(c => ({ ...c, isWinningPath: winPath!.includes(c.index) }))
        : newBoard;

      if (hasWinner) setTimeout(() => sfx.playWin(), 500);

      // No turn rotation — host decides freely who answered first
      return {
        ...prev,
        board: finalBoard,
        winner: hasWinner ? team : null,
        winningPath: winPath || [],
        team1Score: team === 'team1' ? prev.team1Score + 1 : prev.team1Score,
        team2Score: team === 'team2' ? prev.team2Score + 1 : prev.team2Score,
      };
    });

    setSelectedCell(null);
    setCurrentQuestion(null);
  }, [selectedCell, sfx]);

  const handleWrong = useCallback(() => {
    sfx.playWrong();
    // No turn switch — neither team scored, host moves on
    setSelectedCell(null);
    setCurrentQuestion(null);
  }, [sfx]);

  const playAgain = useCallback(() => {
    setGameState({ ...createInitialGameState(), team1Name, team2Name, team1Color, team2Color });
  }, [team1Name, team2Name, team1Color, team2Color]);

  const currentTeamName = gameState.currentTurn === 'team1' ? team1Name : team2Name;
  const turnColor = currentTurnColor === 'terracotta' ? '#f28b44' : '#4a80e8';

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: '#1a3644' }}>
      {/* Header */}
      <div className="pt-4 pb-2 px-4">
        <GameTitle hostName={hostName} className="scale-90 md:scale-100" />
      </div>

      {/* Game area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-2 md:px-4 py-2 md:py-4">
        {/* Score panels + Board */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 w-full max-w-5xl">
          {/* Team 2 score (right side in RTL) */}
          <div className="order-1 md:order-1">
            <ScorePanel teamName={team2Name} score={gameState.team2Score} teamColor={team2Color} isActive={gameState.currentTurn === 'team2'} />
          </div>

          {/* Board */}
          <div className="order-2 md:order-2 w-full max-w-[600px] md:max-w-[700px]">
            <HexBoard
              board={gameState.board} currentTurn={gameState.currentTurn}
              team1Color={team1Color} team2Color={team2Color}
              onHexClick={handleHexClick} disabled={!isHost || !!gameState.winner}
            />
          </div>

          {/* Team 1 score (left side in RTL) */}
          <div className="order-3 md:order-3">
            <ScorePanel teamName={team1Name} score={gameState.team1Score} teamColor={team1Color} isActive={gameState.currentTurn === 'team1'} />
          </div>
        </div>

        {/* Status indicator — no turns; just prompt host */}
        {!gameState.winner && (
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
          answerRevealed={answerRevealed} currentTurnColor={currentTurnColor}
          team1Name={team1Name} team2Name={team2Name}
          onCorrectTeam1={() => awardHex('team1')} onCorrectTeam2={() => awardHex('team2')}
          onWrong={handleWrong} onClose={() => { setSelectedCell(null); setCurrentQuestion(null); }}
        />
      )}

      {gameState.winner && (
        <WinnerOverlay
          winnerName={gameState.winner === 'team1' ? team1Name : team2Name}
          winnerColor={gameState.winner === 'team1' ? team1Color : team2Color}
          onPlayAgain={playAgain} onMainMenu={() => navigate("/")}
        />
      )}

      <GameFooter />
    </div>
  );
};

export default Game;
