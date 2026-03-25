// ============================
// Game: Live game stage with hex board, scores, question flow, golden questions, and sound
// ============================
import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import HexBoard from "@/components/game/HexBoard";
import ScorePanel from "@/components/game/ScorePanel";
import QuestionModal from "@/components/game/QuestionModal";
import GameTitle from "@/components/game/GameTitle";
import WinnerOverlay from "@/components/game/WinnerOverlay";
import mascotImg from "@/assets/mascot.png";
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
    team1Name,
    team2Name,
    team1Color,
    team2Color,
  }));

  const [selectedCell, setSelectedCell] = useState<HexCell | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<{ question: string; answer: string; category: string } | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);

  const currentTurnColor = gameState.currentTurn === 'team1' ? team1Color : team2Color;

  // Handle hex click
  const handleHexClick = useCallback((cell: HexCell) => {
    if (!isHost || cell.status !== 'unclaimed' || gameState.winner) return;

    sfx.playHexSelect();

    // Golden question = free point, no question needed
    if (cell.isGolden) {
      sfx.playGolden();
      setSelectedCell(cell);
      setCurrentQuestion({
        question: '⭐ سؤال ذهبي! نقطة مجانية لأحد الفريقين ⭐',
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
  }, [isHost, gameState.winner, sfx]);

  // Award hex to a team
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

      if (hasWinner) {
        setTimeout(() => sfx.playWin(), 500);
      }

      return {
        ...prev,
        board: finalBoard,
        currentTurn: prev.currentTurn === 'team1' ? 'team2' : 'team1',
        winner: hasWinner ? team : null,
        winningPath: winPath || [],
        team1Score: team === 'team1' ? prev.team1Score + 1 : prev.team1Score,
        team2Score: team === 'team2' ? prev.team2Score + 1 : prev.team2Score,
      };
    });

    setSelectedCell(null);
    setCurrentQuestion(null);
  }, [selectedCell, sfx]);

  // Wrong answer
  const handleWrong = useCallback(() => {
    sfx.playWrong();
    setGameState(prev => ({
      ...prev,
      currentTurn: prev.currentTurn === 'team1' ? 'team2' : 'team1',
    }));
    setSelectedCell(null);
    setCurrentQuestion(null);
  }, [sfx]);

  // Play again
  const playAgain = useCallback(() => {
    setGameState({
      ...createInitialGameState(),
      team1Name,
      team2Name,
      team1Color,
      team2Color,
    });
  }, [team1Name, team2Name, team1Color, team2Color]);

  const currentTeamName = gameState.currentTurn === 'team1' ? team1Name : team2Name;

  return (
    <div className="min-h-screen stage-bg sweep-light flex flex-col">
      {/* Header */}
      <div className="pt-4 pb-2 px-4 relative">
        <GameTitle hostName={hostName} />
        {/* Mascot watermark - subtle corner */}
        <img
          src={mascotImg}
          alt=""
          className="absolute top-3 left-3 w-10 h-10 object-contain opacity-20 pointer-events-none"
        />
      </div>

      {/* Game area */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 px-4 py-4">
        <ScorePanel
          teamName={team1Name}
          score={gameState.team1Score}
          teamColor={team1Color}
          isActive={gameState.currentTurn === 'team1'}
        />

        <div className="relative">
          <img
            src={mascotImg}
            alt=""
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 object-contain opacity-[0.03] pointer-events-none"
          />
          <HexBoard
            board={gameState.board}
            currentTurn={gameState.currentTurn}
            team1Color={team1Color}
            team2Color={team2Color}
            onHexClick={handleHexClick}
            disabled={!isHost || !!gameState.winner}
          />
        </div>

        <ScorePanel
          teamName={team2Name}
          score={gameState.team2Score}
          teamColor={team2Color}
          isActive={gameState.currentTurn === 'team2'}
        />
      </div>

      {/* Turn indicator */}
      <motion.div
        className="text-center py-3 font-tajawal font-bold text-lg"
        style={{ color: currentTurnColor === 'terracotta' ? '#E57A44' : '#3B82F6' }}
        key={gameState.currentTurn}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {!gameState.winner && (
          <>
            الدور الآن: {currentTeamName}
            {!isHost && <span className="text-cream/40 text-sm mr-2"> (في انتظار المضيف...)</span>}
          </>
        )}
      </motion.div>

      {/* Question Modal */}
      {currentQuestion && selectedCell && (
        <QuestionModal
          isOpen={true}
          letter={selectedCell.letter}
          question={currentQuestion.question}
          answer={currentQuestion.answer}
          category={currentQuestion.category}
          isHost={isHost}
          answerRevealed={answerRevealed}
          currentTurnColor={currentTurnColor}
          team1Name={team1Name}
          team2Name={team2Name}
          onCorrectTeam1={() => awardHex('team1')}
          onCorrectTeam2={() => awardHex('team2')}
          onWrong={handleWrong}
          onClose={() => { setSelectedCell(null); setCurrentQuestion(null); }}
        />
      )}

      {/* Winner overlay */}
      {gameState.winner && (
        <WinnerOverlay
          winnerName={gameState.winner === 'team1' ? team1Name : team2Name}
          winnerColor={gameState.winner === 'team1' ? team1Color : team2Color}
          onPlayAgain={playAgain}
          onMainMenu={() => navigate("/")}
        />
      )}
    </div>
  );
};

export default Game;
