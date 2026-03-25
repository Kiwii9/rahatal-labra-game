// ============================
// HexBoard: 5x5 hex grid with team-colored border rows, no floating artifacts
// ============================
import { motion } from "framer-motion";
import type { HexCell as HexCellType } from "@/lib/gameLogic";

interface HexBoardProps {
  board: HexCellType[];
  currentTurn: 'team1' | 'team2';
  team1Color: 'terracotta' | 'blue';
  team2Color: 'terracotta' | 'blue';
  onHexClick: (cell: HexCellType) => void;
  disabled?: boolean;
}

const COLORS = {
  terracotta: 'hsl(20 76% 58%)',
  blue: 'hsl(217 92% 60%)',
  unclaimed: 'hsl(192 58% 25%)',
  golden: 'hsl(48 96% 53%)',
} as const;

const HexBoard = ({ board, currentTurn, team1Color, team2Color, onHexClick, disabled }: HexBoardProps) => {
  const getTeamColor = (status: 'team1' | 'team2') =>
    COLORS[status === 'team1' ? team1Color : team2Color];

  const currentColor = COLORS[currentTurn === 'team1' ? team1Color : team2Color];

  const cellW = 88;
  const cellH = 98;
  const rowOffset = cellW * 0.52;
  const borderW = 44;
  const borderH = 49;

  const team1Hex = COLORS[team1Color];
  const team2Hex = COLORS[team2Color];

  const boardW = 5 * cellW + rowOffset + 20;
  const boardH = 5 * cellH * 0.76 + 40;

  const renderBorderHexes = () => {
    const hexes: JSX.Element[] = [];

    // Team 1 (top-bottom): rows of small hexes
    for (let col = 0; col < 6; col++) {
      hexes.push(
        <div key={`t1-top-${col}`} className="hex-cell absolute"
          style={{ width: borderW, height: borderH, left: col * (borderW * 0.88) + 35, top: -borderH * 0.5 - 4, backgroundColor: team1Hex, opacity: 0.6 }} />
      );
      hexes.push(
        <div key={`t1-bot-${col}`} className="hex-cell absolute"
          style={{ width: borderW, height: borderH, left: col * (borderW * 0.88) + 58, top: boardH + borderH * 0.04, backgroundColor: team1Hex, opacity: 0.6 }} />
      );
    }

    // Team 2 (left-right): columns of small hexes
    for (let row = 0; row < 6; row++) {
      hexes.push(
        <div key={`t2-left-${row}`} className="hex-cell absolute"
          style={{ width: borderW, height: borderH, left: -borderW * 0.5 - 4, top: row * (borderH * 0.72) + 10, backgroundColor: team2Hex, opacity: 0.6 }} />
      );
      hexes.push(
        <div key={`t2-right-${row}`} className="hex-cell absolute"
          style={{ width: borderW, height: borderH, left: boardW - borderW * 0.35, top: row * (borderH * 0.72) + 10, backgroundColor: team2Hex, opacity: 0.6 }} />
      );
    }

    return hexes;
  };

  return (
    <div className="relative mx-auto" style={{ width: boardW, height: boardH, padding: '20px' }}>
      {renderBorderHexes()}

      {board.map((cell, i) => {
        const isOddRow = cell.row % 2 === 1;
        const x = cell.col * cellW + (isOddRow ? rowOffset : 0) + 10;
        const y = cell.row * (cellH * 0.76) + 15;

        const isClaimed = cell.status !== 'unclaimed';
        const bgColor = isClaimed
          ? getTeamColor(cell.status as 'team1' | 'team2')
          : cell.isGolden ? COLORS.golden : COLORS.unclaimed;

        const isGoldenUnclaimed = cell.isGolden && !isClaimed;

        return (
          <motion.div
            key={cell.index}
            className="hex-cell absolute cursor-pointer flex items-center justify-center select-none"
            style={{
              width: cellW,
              height: cellH,
              left: x,
              top: y,
              backgroundColor: bgColor,
              boxShadow: cell.isWinningPath
                ? `0 0 30px ${bgColor}, inset 0 0 15px rgba(255,255,255,0.3), 0 0 60px ${bgColor}`
                : isGoldenUnclaimed
                  ? `0 0 20px ${COLORS.golden}60, inset 0 1px 0 rgba(255,255,255,0.3)`
                  : isClaimed
                    ? `inset 0 3px 8px rgba(0,0,0,0.3), 0 0 15px ${bgColor}40`
                    : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: cell.isWinningPath ? [1, 1.05, 1] : 1,
              opacity: 1,
            }}
            transition={{
              delay: i * 0.03,
              duration: 0.4,
              scale: cell.isWinningPath ? { repeat: Infinity, duration: 1.5 } : undefined,
            }}
            whileHover={
              !isClaimed && !disabled
                ? { scale: 1.1, boxShadow: `0 0 20px ${currentColor}99, inset 0 0 10px ${currentColor}33`, transition: { duration: 0.2 } }
                : undefined
            }
            whileTap={!isClaimed && !disabled ? { scale: 0.95 } : undefined}
            onClick={() => !disabled && !isClaimed && onHexClick(cell)}
          >
            {isGoldenUnclaimed && (
              <motion.span
                className="absolute -top-1 -right-1 text-xs"
                animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                ⭐
              </motion.span>
            )}
            <span
              className="text-2xl md:text-3xl font-tajawal font-[900] z-10 pointer-events-none"
              style={{
                color: isGoldenUnclaimed ? 'hsl(var(--midnight))' : isClaimed ? '#FEFEFE' : 'hsl(var(--cream))',
                textShadow: isClaimed ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              {cell.letter}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default HexBoard;
