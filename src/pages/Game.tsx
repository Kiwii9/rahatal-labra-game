// ============================
// Game: Live game stage with hex board, scores, and question flow
// ============================
import { useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import HexBoard from "@/components/game/HexBoard";
import ScorePanel from "@/components/game/ScorePanel";
import QuestionModal from "@/components/game/QuestionModal";
import GameTitle from "@/components/game/GameTitle";
import WinnerOverlay from "@/components/game/WinnerOverlay";
import mascotImg from "@/assets/mascot.png";
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

  // Question modal state
  const [selectedCell, setSelectedCell] = useState<HexCell | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<{ question: string; answer: string; category: string } | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);

  const currentTurnColor = gameState.currentTurn === 'team1' ? team1Color : team2Color;

  // Handle hex click - opens question modal
  const handleHexClick = useCallback((cell: HexCell) => {
    if (!isHost || cell.status !== 'unclaimed' || gameState.winner) return;
    const q = getQuestionForLetter(cell.letter);
    setSelectedCell(cell);
    setCurrentQuestion(q);
    setAnswerRevealed(false);
  }, [isHost, gameState.winner]);

  // Award hex to a team
  const awardHex = useCallback((team: 'team1' | 'team2') => {
    if (!selectedCell) return;

    setGameState(prev => {
      const newBoard = prev.board.map(c =>
        c.index === selectedCell.index ? { ...c, status: team } : c
      );

      // Check for win
      const winPath = checkWin(newBoard, team);
      const hasWinner = winPath !== null;

      // Mark winning path cells
      const finalBoard = hasWinner
        ? newBoard.map(c => ({
          ...c,
          isWinningPath: winPath!.includes(c.index),
        }))
        : newBoard;

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
  }, [selectedCell]);

  // Handle wrong answer - just close modal, no hex claimed
  const handleWrong = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentTurn: prev.currentTurn === 'team1' ? 'team2' : 'team1',
    }));
    setSelectedCell(null);
    setCurrentQuestion(null);
  }, []);

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
      <div className="pt-6 pb-2 px-4 relative">
        <GameTitle hostName={hostName} />
        {/* Mascot watermark */}
        <img
          src={mascotImg}
          alt=""
          className="absolute top-4 left-4 w-12 h-12 object-contain opacity-30"
        />
      </div>

      {/* Game area */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 px-4 py-6">
        {/* Team 1 Score */}
        <ScorePanel
          teamName={team1Name}
          score={gameState.team1Score}
          teamColor={team1Color}
          isActive={gameState.currentTurn === 'team1'}
        />

        {/* Hex Board */}
        <div className="relative">
          {/* Mascot watermark behind board */}
          <img
            src={mascotImg}
            alt=""
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 object-contain opacity-[0.04] pointer-events-none"
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

        {/* Team 2 Score */}
        <ScorePanel
          teamName={team2Name}
          score={gameState.team2Score}
          teamColor={team2Color}
          isActive={gameState.currentTurn === 'team2'}
        />
      </div>

      {/* Turn indicator footer */}
      <motion.div
        className="text-center py-4 font-tajawal font-bold text-lg"
        style={{
          color: currentTurnColor === 'terracotta' ? '#E57A44' : '#3B82F6',
        }}
        key={gameState.currentTurn}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {!gameState.winner && (
          <>
            الدور الآن: {currentTeamName}
            {!isHost && <span className="text-cream/50 text-sm mr-2"> (في انتظار المضيف...)</span>}
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
