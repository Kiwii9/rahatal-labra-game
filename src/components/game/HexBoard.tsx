// ============================
// HexBoard: SVG-based interlocking hex grid with attached team-colored borders
// Uses proper hex math for perfect tessellation
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
  terracotta: '#f28b44',
  blue: '#4a80e8',
  unclaimed: '#1b5967',
  golden: '#FACC15',
} as const;

// Pointy-top hex geometry
const HEX_SIZE = 40; // radius
const HEX_W = Math.sqrt(3) * HEX_SIZE; // width = sqrt(3) * size
const HEX_H = 2 * HEX_SIZE; // height = 2 * size
const ROW_H = HEX_H * 0.75; // vertical spacing

function hexPoints(cx: number, cy: number, size: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

function hexCenter(row: number, col: number, offsetX: number, offsetY: number): [number, number] {
  const x = offsetX + col * HEX_W + (row % 2 === 1 ? HEX_W / 2 : 0);
  const y = offsetY + row * ROW_H;
  return [x, y];
}

const BORDER_SIZE = HEX_SIZE * 0.45;
const BORDER_W = Math.sqrt(3) * BORDER_SIZE;
const BORDER_ROW_H = 2 * BORDER_SIZE * 0.75;

function borderHexPoints(cx: number, cy: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${cx + BORDER_SIZE * Math.cos(angle)},${cy + BORDER_SIZE * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

const HexBoard = ({ board, currentTurn, team1Color, team2Color, onHexClick, disabled }: HexBoardProps) => {
  const getTeamColor = (status: 'team1' | 'team2') =>
    COLORS[status === 'team1' ? team1Color : team2Color];

  const currentColor = COLORS[currentTurn === 'team1' ? team1Color : team2Color];
  const team1Hex = COLORS[team1Color];
  const team2Hex = COLORS[team2Color];

  const padding = 50;
  const gridW = 4 * HEX_W + HEX_W / 2; // 5 cols, stagger
  const gridH = 4 * ROW_H + HEX_H;
  const svgW = gridW + padding * 2 + 40;
  const svgH = gridH + padding * 2 + 20;
  const ox = padding + HEX_W / 2 + 20;
  const oy = padding + HEX_SIZE + 5;

  // Border hexes: Team1 (top-bottom connecting), Team2 (left-right connecting)
  const renderBorderHexes = () => {
    const elements: JSX.Element[] = [];

    // Team 1 borders: TOP row and BOTTOM row (horizontal bands)
    for (let c = 0; c < 7; c++) {
      // Top border
      const tx = ox - BORDER_W * 0.5 + c * BORDER_W * 0.92;
      const ty = oy - HEX_SIZE - BORDER_SIZE * 0.6;
      elements.push(
        <polygon
          key={`t1-top-${c}`}
          points={borderHexPoints(tx, ty)}
          fill={team1Hex}
          opacity={0.7}
        />
      );
      // Bottom border
      const bx = ox + (HEX_W / 4) - BORDER_W * 0.5 + c * BORDER_W * 0.92;
      const by = oy + 4 * ROW_H + HEX_SIZE + BORDER_SIZE * 0.6;
      elements.push(
        <polygon
          key={`t1-bot-${c}`}
          points={borderHexPoints(bx, by)}
          fill={team1Hex}
          opacity={0.7}
        />
      );
    }

    // Team 2 borders: LEFT column and RIGHT column (vertical bands)
    for (let r = 0; r < 7; r++) {
      // Left border
      const lx = ox - HEX_W * 0.5 - BORDER_SIZE * 1.1;
      const ly = oy - BORDER_SIZE + r * BORDER_ROW_H * 1.05;
      elements.push(
        <polygon
          key={`t2-left-${r}`}
          points={borderHexPoints(lx, ly)}
          fill={team2Hex}
          opacity={0.7}
        />
      );
      // Right border
      const rx = ox + 4 * HEX_W + HEX_W * 0.5 + BORDER_SIZE * 1.1;
      const ry = oy - BORDER_SIZE + r * BORDER_ROW_H * 1.05;
      elements.push(
        <polygon
          key={`t2-right-${r}`}
          points={borderHexPoints(rx, ry)}
          fill={team2Hex}
          opacity={0.7}
        />
      );
    }

    return elements;
  };

  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-[600px] md:max-w-[700px] h-auto"
        style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))' }}
      >
        {/* Border hexes */}
        {renderBorderHexes()}

        {/* Main grid */}
        {board.map((cell, i) => {
          const [cx, cy] = hexCenter(cell.row, cell.col, ox, oy);
          const isClaimed = cell.status !== 'unclaimed';
          const bgColor = isClaimed
            ? getTeamColor(cell.status as 'team1' | 'team2')
            : cell.isGolden ? COLORS.golden : COLORS.unclaimed;
          const isGoldenUnclaimed = cell.isGolden && !isClaimed;
          const clickable = !isClaimed && !disabled;

          return (
            <g
              key={cell.index}
              onClick={() => clickable && onHexClick(cell)}
              style={{ cursor: clickable ? 'pointer' : 'default' }}
              className="hex-interactive"
            >
              {/* Glow for winning path */}
              {cell.isWinningPath && (
                <polygon
                  points={hexPoints(cx, cy, HEX_SIZE + 4)}
                  fill="none"
                  stroke={bgColor}
                  strokeWidth="3"
                  opacity="0.6"
                >
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" />
                </polygon>
              )}

              {/* Main hex */}
              <motion.polygon
                points={hexPoints(cx, cy, HEX_SIZE - 1)}
                fill={bgColor}
                stroke={isClaimed ? bgColor : 'rgba(255,255,255,0.08)'}
                strokeWidth="1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
              />

              {/* Hover overlay for unclaimed */}
              {clickable && (
                <polygon
                  points={hexPoints(cx, cy, HEX_SIZE - 1)}
                  fill="transparent"
                  className="hex-hover-target"
                  style={{ transition: 'fill 0.2s' }}
                  onMouseEnter={(e) => { (e.target as SVGPolygonElement).style.fill = `${currentColor}33`; }}
                  onMouseLeave={(e) => { (e.target as SVGPolygonElement).style.fill = 'transparent'; }}
                />
              )}

              {/* Letter */}
              <text
                x={cx}
                y={cy + 2}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-tajawal"
                style={{
                  fontSize: isGoldenUnclaimed ? '18px' : '20px',
                  fontWeight: 900,
                  fill: isGoldenUnclaimed ? '#1a3644' : isClaimed ? '#ffffff' : '#e8dcc8',
                  pointerEvents: 'none',
                  textShadow: isClaimed ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
                }}
              >
                {cell.letter}
              </text>

              {/* Golden star indicator - subtle, hidden until clicked */}
              {isGoldenUnclaimed && (
                <text
                  x={cx + HEX_SIZE * 0.55}
                  y={cy - HEX_SIZE * 0.45}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontSize: '10px', pointerEvents: 'none', opacity: 0 }}
                >
                  ★
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default HexBoard;
