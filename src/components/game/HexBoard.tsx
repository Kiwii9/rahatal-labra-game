// ============================
// HexBoard: 5x5 interlocking honeycomb grid
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
  mascotOpacity?: number;
}

const HexBoard = ({ board, currentTurn, team1Color, team2Color, onHexClick, disabled }: HexBoardProps) => {
  // Get the actual color for a team assignment
  const getTeamColorClass = (status: 'team1' | 'team2') => {
    const color = status === 'team1' ? team1Color : team2Color;
    return color === 'terracotta' ? 'terracotta' : 'blue';
  };

  const getHoverColor = () => {
    const color = currentTurn === 'team1' ? team1Color : team2Color;
    return color === 'terracotta'
      ? '0 0 20px rgba(229,122,68,0.6), inset 0 0 10px rgba(229,122,68,0.2)'
      : '0 0 20px rgba(59,130,246,0.6), inset 0 0 10px rgba(59,130,246,0.2)';
  };

  // Cell dimensions
  const cellW = 90;
  const cellH = 100;
  const rowOffset = cellW * 0.52; // horizontal offset for odd rows

  return (
    <div className="relative mx-auto" style={{ width: 5 * cellW + rowOffset + 20, height: 5 * cellH * 0.78 + 40 }}>
      {/* Directional indicators */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold tracking-widest"
        style={{ color: team1Color === 'terracotta' ? '#E57A44' : '#3B82F6' }}>
        ▼ الفريق الأول ▼
      </div>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold tracking-widest"
        style={{ color: team1Color === 'terracotta' ? '#E57A44' : '#3B82F6' }}>
        ▲ الفريق الأول ▲
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 -right-16 text-xs font-bold tracking-widest"
        style={{ color: team2Color === 'terracotta' ? '#E57A44' : '#3B82F6', writingMode: 'vertical-rl' }}>
        ◄ الفريق الثاني
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 -left-16 text-xs font-bold tracking-widest"
        style={{ color: team2Color === 'terracotta' ? '#E57A44' : '#3B82F6', writingMode: 'vertical-rl' }}>
        الفريق الثاني ►
      </div>

      {board.map((cell, i) => {
        const isOddRow = cell.row % 2 === 1;
        const x = cell.col * cellW + (isOddRow ? rowOffset : 0) + 10;
        const y = cell.row * (cellH * 0.76) + 15;

        const isClaimed = cell.status !== 'unclaimed';
        const teamColor = isClaimed ? getTeamColorClass(cell.status as 'team1' | 'team2') : null;

        const bgColor = !isClaimed
          ? '#1B5967'
          : teamColor === 'terracotta'
            ? '#E57A44'
            : '#3B82F6';

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
                ? {
                  scale: 1.1,
                  boxShadow: getHoverColor(),
                  transition: { duration: 0.2 },
                }
                : undefined
            }
            whileTap={!isClaimed && !disabled ? { scale: 0.95 } : undefined}
            onClick={() => !disabled && !isClaimed && onHexClick(cell)}
          >
            <span
              className="text-2xl md:text-3xl font-tajawal font-[900] z-10 pointer-events-none"
              style={{
                color: isClaimed ? '#FEFEFE' : '#FFF8E7',
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
