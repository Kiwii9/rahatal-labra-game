// ============================
// HexBoard: 5x5 interlocking honeycomb grid with team-colored border rows
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

// Color constants
const COLORS = {
  terracotta: '#E57A44',
  blue: '#3B82F6',
  unclaimed: '#1B5967',
  golden: '#FACC15',
} as const;

const HexBoard = ({ board, currentTurn, team1Color, team2Color, onHexClick, disabled }: HexBoardProps) => {
  const getTeamActualColor = (status: 'team1' | 'team2') => {
    const color = status === 'team1' ? team1Color : team2Color;
    return COLORS[color];
  };

  const getHoverShadow = () => {
    const color = currentTurn === 'team1' ? COLORS[team1Color] : COLORS[team2Color];
    return `0 0 20px ${color}99, inset 0 0 10px ${color}33`;
  };

  // Cell dimensions
  const cellW = 88;
  const cellH = 98;
  const rowOffset = cellW * 0.52;

  // Border hex dimensions (smaller)
  const borderW = 44;
  const borderH = 49;

  const team1Hex = COLORS[team1Color];
  const team2Hex = COLORS[team2Color];

  // Calculate board dimensions
  const boardW = 5 * cellW + rowOffset + 20;
  const boardH = 5 * cellH * 0.76 + 40;

  // Render team-colored border hexagons
  const renderBorderHexes = () => {
    const hexes: JSX.Element[] = [];

    // Team 1 (top-bottom): row of hexes above and below the board
    for (let col = 0; col < 6; col++) {
      // Top border
      hexes.push(
        <div
          key={`t1-top-${col}`}
          className="hex-cell absolute"
          style={{
            width: borderW,
            height: borderH,
            left: col * (borderW * 0.88) + 35,
            top: -borderH * 0.5 - 4,
            backgroundColor: team1Hex,
            opacity: 0.7,
          }}
        />
      );
      // Bottom border
      hexes.push(
        <div
          key={`t1-bot-${col}`}
          className="hex-cell absolute"
          style={{
            width: borderW,
            height: borderH,
            left: col * (borderW * 0.88) + 58,
            top: boardH + borderH * 0.04,
            backgroundColor: team1Hex,
            opacity: 0.7,
          }}
        />
      );
    }

    // Team 2 (left-right): column of hexes on left and right sides
    for (let row = 0; row < 6; row++) {
      // Left border
      hexes.push(
        <div
          key={`t2-left-${row}`}
          className="hex-cell absolute"
          style={{
            width: borderW,
            height: borderH,
            left: -borderW * 0.5 - 4,
            top: row * (borderH * 0.72) + 10,
            backgroundColor: team2Hex,
            opacity: 0.7,
          }}
        />
      );
      // Right border
      hexes.push(
        <div
          key={`t2-right-${row}`}
          className="hex-cell absolute"
          style={{
            width: borderW,
            height: borderH,
            left: boardW - borderW * 0.35,
            top: row * (borderH * 0.72) + 10,
            backgroundColor: team2Hex,
            opacity: 0.7,
          }}
        />
      );
    }

    return hexes;
  };

  return (
    <div className="relative mx-auto" style={{ width: boardW, height: boardH, padding: '20px' }}>
      {/* Border hexagons for team indicators */}
      {renderBorderHexes()}

      {/* Direction labels */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-xs font-bold tracking-wider font-tajawal"
        style={{ color: team1Hex }}>
        ▼ {board.length > 0 ? '' : ''} ▼
      </div>
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-xs font-bold tracking-wider font-tajawal"
        style={{ color: team1Hex }}>
        ▲ ▲
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 -right-14 text-xs font-bold font-tajawal"
        style={{ color: team2Hex, writingMode: 'vertical-rl' }}>
        ◄
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 -left-14 text-xs font-bold font-tajawal"
        style={{ color: team2Hex, writingMode: 'vertical-rl' }}>
        ►
      </div>

      {/* Main game cells */}
      {board.map((cell, i) => {
        const isOddRow = cell.row % 2 === 1;
        const x = cell.col * cellW + (isOddRow ? rowOffset : 0) + 10;
        const y = cell.row * (cellH * 0.76) + 15;

        const isClaimed = cell.status !== 'unclaimed';
        const bgColor = isClaimed
          ? getTeamActualColor(cell.status as 'team1' | 'team2')
          : cell.isGolden
            ? COLORS.golden
            : COLORS.unclaimed;

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
                ? { scale: 1.1, boxShadow: getHoverShadow(), transition: { duration: 0.2 } }
                : undefined
            }
            whileTap={!isClaimed && !disabled ? { scale: 0.95 } : undefined}
            onClick={() => !disabled && !isClaimed && onHexClick(cell)}
          >
            {/* Golden star indicator */}
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
                color: isGoldenUnclaimed ? '#03222F' : isClaimed ? '#FEFEFE' : '#FFF8E7',
                textShadow: isClaimed
                  ? '0 1px 3px rgba(0,0,0,0.4)'
                  : '0 1px 2px rgba(0,0,0,0.2)',
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
