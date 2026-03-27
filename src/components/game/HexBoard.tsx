// ============================
// HexBoard: SVG hex grid with triangle border bases matching reference layout
// Team 1 (top-bottom) gets top/bottom triangle borders
// Team 2 (left-right) gets left/right triangle borders
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
  terracotta: 'hsl(25, 87%, 61%)',
  blue: 'hsl(222, 78%, 60%)',
  unclaimed: 'hsl(192, 58%, 25%)',
  golden: 'hsl(48, 96%, 53%)',
} as const;

// Pointy-top hex geometry
const HEX_SIZE = 38;
const HEX_W = Math.sqrt(3) * HEX_SIZE;
const HEX_H = 2 * HEX_SIZE;
const ROW_H = HEX_H * 0.75;
const GRID_ROWS = 5;
const GRID_COLS = 5;

function hexPoints(cx: number, cy: number, size: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

function hexCenter(row: number, col: number, ox: number, oy: number): [number, number] {
  const x = ox + col * HEX_W + (row % 2 === 1 ? HEX_W / 2 : 0);
  const y = oy + row * ROW_H;
  return [x, y];
}

const HexBoard = ({ board, currentTurn, team1Color, team2Color, onHexClick, disabled }: HexBoardProps) => {
  const getTeamColor = (status: 'team1' | 'team2') =>
    COLORS[status === 'team1' ? team1Color : team2Color];

  const currentColor = COLORS[currentTurn === 'team1' ? team1Color : team2Color];
  const team1Hex = COLORS[team1Color];
  const team2Hex = COLORS[team2Color];

  const padding = 60;
  const gridW = (GRID_COLS - 1) * HEX_W + HEX_W / 2;
  const gridH = (GRID_ROWS - 1) * ROW_H;
  const svgW = gridW + padding * 2 + HEX_W;
  const svgH = gridH + padding * 2 + HEX_H + 40;
  const ox = padding + HEX_W / 2 + 10;
  const oy = padding + HEX_SIZE + 20;

  // Render border hexagons that physically enclose the grid (matching reference layout)
  const renderBorders = () => {
    const elements: JSX.Element[] = [];
    const borderSize = HEX_SIZE * 0.45;

    // Team 1: TOP border - row of small triangles along top edge
    for (let col = 0; col < GRID_COLS; col++) {
      const [cx, cy] = hexCenter(0, col, ox, oy);
      const topY = cy - HEX_SIZE;
      const triH = borderSize;
      elements.push(
        <polygon
          key={`t1-top-${col}`}
          points={`${cx - HEX_W * 0.35},${topY - triH} ${cx + HEX_W * 0.35},${topY - triH} ${cx},${topY + 2}`}
          fill={team1Hex}
          opacity={0.9}
          stroke={team1Hex}
          strokeWidth="1"
        />
      );
    }
    for (let col = 0; col < GRID_COLS - 1; col++) {
      const [cx1, cy1] = hexCenter(0, col, ox, oy);
      const [cx2] = hexCenter(0, col + 1, ox, oy);
      const midX = (cx1 + cx2) / 2;
      const topY = cy1 - HEX_SIZE;
      const triH = borderSize;
      elements.push(
        <polygon
          key={`t1-top-gap-${col}`}
          points={`${midX - HEX_W * 0.25},${topY - triH} ${midX + HEX_W * 0.25},${topY - triH} ${midX},${topY + 2}`}
          fill={team1Hex}
          opacity={0.75}
          stroke={team1Hex}
          strokeWidth="0.5"
        />
      );
    }
    // Connecting bar along top
    const [topLeft] = hexCenter(0, 0, ox, oy);
    const [topRight] = hexCenter(0, GRID_COLS - 1, ox, oy);
    const topBarY = hexCenter(0, 0, ox, oy)[1] - HEX_SIZE - borderSize;
    elements.push(
      <rect
        key="t1-top-bar"
        x={topLeft - HEX_W * 0.35}
        y={topBarY - 4}
        width={topRight - topLeft + HEX_W * 0.7}
        height={6}
        rx={3}
        fill={team1Hex}
        opacity={0.9}
      />
    );

    // Team 1: BOTTOM border
    for (let col = 0; col < GRID_COLS; col++) {
      const [cx, cy] = hexCenter(GRID_ROWS - 1, col, ox, oy);
      const botY = cy + HEX_SIZE;
      const triH = borderSize;
      elements.push(
        <polygon
          key={`t1-bot-${col}`}
          points={`${cx - HEX_W * 0.35},${botY + triH} ${cx + HEX_W * 0.35},${botY + triH} ${cx},${botY - 2}`}
          fill={team1Hex}
          opacity={0.9}
          stroke={team1Hex}
          strokeWidth="1"
        />
      );
    }
    for (let col = 0; col < GRID_COLS - 1; col++) {
      const [cx1, cy1] = hexCenter(GRID_ROWS - 1, col, ox, oy);
      const [cx2] = hexCenter(GRID_ROWS - 1, col + 1, ox, oy);
      const midX = (cx1 + cx2) / 2;
      const botY = cy1 + HEX_SIZE;
      const triH = borderSize;
      elements.push(
        <polygon
          key={`t1-bot-gap-${col}`}
          points={`${midX - HEX_W * 0.25},${botY + triH} ${midX + HEX_W * 0.25},${botY + triH} ${midX},${botY - 2}`}
          fill={team1Hex}
          opacity={0.75}
          stroke={team1Hex}
          strokeWidth="0.5"
        />
      );
    }
    // Connecting bar along bottom
    const [botLeft] = hexCenter(GRID_ROWS - 1, 0, ox, oy);
    const [botRight] = hexCenter(GRID_ROWS - 1, GRID_COLS - 1, ox, oy);
    const botBarY = hexCenter(GRID_ROWS - 1, 0, ox, oy)[1] + HEX_SIZE + borderSize;
    elements.push(
      <rect
        key="t1-bot-bar"
        x={botLeft - HEX_W * 0.35}
        y={botBarY - 2}
        width={botRight - botLeft + HEX_W * 0.7}
        height={6}
        rx={3}
        fill={team1Hex}
        opacity={0.9}
      />
    );

    // Team 2: LEFT border
    for (let row = 0; row < GRID_ROWS; row++) {
      const [cx, cy] = hexCenter(row, 0, ox, oy);
      const leftX = cx - HEX_W / 2;
      const triW = borderSize;
      elements.push(
        <polygon
          key={`t2-left-${row}`}
          points={`${leftX - triW},${cy - HEX_SIZE * 0.35} ${leftX - triW},${cy + HEX_SIZE * 0.35} ${leftX + 2},${cy}`}
          fill={team2Hex}
          opacity={0.9}
          stroke={team2Hex}
          strokeWidth="1"
        />
      );
    }
    // Fill gaps between left column rows
    for (let row = 0; row < GRID_ROWS - 1; row++) {
      const [, cy1] = hexCenter(row, 0, ox, oy);
      const [cx2, cy2] = hexCenter(row + 1, 0, ox, oy);
      const leftX1 = hexCenter(row, 0, ox, oy)[0] - HEX_W / 2;
      const leftX2 = cx2 - HEX_W / 2;
      const midY = (cy1 + cy2) / 2;
      const midX = (leftX1 + leftX2) / 2;
      elements.push(
        <polygon
          key={`t2-left-gap-${row}`}
          points={`${midX - borderSize},${midY - HEX_SIZE * 0.2} ${midX - borderSize},${midY + HEX_SIZE * 0.2} ${midX + 2},${midY}`}
          fill={team2Hex}
          opacity={0.7}
          stroke={team2Hex}
          strokeWidth="0.5"
        />
      );
    }

    // Team 2: RIGHT border
    for (let row = 0; row < GRID_ROWS; row++) {
      const [cx, cy] = hexCenter(row, GRID_COLS - 1, ox, oy);
      const rightX = cx + HEX_W / 2;
      const triW = borderSize;
      elements.push(
        <polygon
          key={`t2-right-${row}`}
          points={`${rightX + triW},${cy - HEX_SIZE * 0.35} ${rightX + triW},${cy + HEX_SIZE * 0.35} ${rightX - 2},${cy}`}
          fill={team2Hex}
          opacity={0.9}
          stroke={team2Hex}
          strokeWidth="1"
        />
      );
    }
    // Fill gaps between right column rows
    for (let row = 0; row < GRID_ROWS - 1; row++) {
      const [, cy1] = hexCenter(row, GRID_COLS - 1, ox, oy);
      const [cx2, cy2] = hexCenter(row + 1, GRID_COLS - 1, ox, oy);
      const rightX1 = hexCenter(row, GRID_COLS - 1, ox, oy)[0] + HEX_W / 2;
      const rightX2 = cx2 + HEX_W / 2;
      const midY = (cy1 + cy2) / 2;
      const midX = (rightX1 + rightX2) / 2;
      elements.push(
        <polygon
          key={`t2-right-gap-${row}`}
          points={`${midX + borderSize},${midY - HEX_SIZE * 0.2} ${midX + borderSize},${midY + HEX_SIZE * 0.2} ${midX - 2},${midY}`}
          fill={team2Hex}
          opacity={0.7}
          stroke={team2Hex}
          strokeWidth="0.5"
        />
      );
    }

    return elements;
  };

  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-[560px] md:max-w-[660px] h-auto"
        style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))' }}
      >
        {/* Border bases */}
        {renderBorders()}

        {/* Main hex grid */}
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
            >
              {/* Winning path glow */}
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

              {/* Main hex body */}
              <motion.polygon
                points={hexPoints(cx, cy, HEX_SIZE - 1)}
                fill={bgColor}
                stroke={isClaimed ? bgColor : 'hsla(0, 0%, 100%, 0.08)'}
                strokeWidth="1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
              />

              {/* Hover highlight */}
              {clickable && (
                <polygon
                  points={hexPoints(cx, cy, HEX_SIZE - 1)}
                  fill="transparent"
                  style={{ transition: 'fill 0.2s' }}
                  onMouseEnter={(e) => { (e.target as SVGPolygonElement).style.fill = `${currentColor}33`; }}
                  onMouseLeave={(e) => { (e.target as SVGPolygonElement).style.fill = 'transparent'; }}
                />
              )}

              {/* Arabic letter */}
              <text
                x={cx}
                y={cy + 2}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-tajawal"
                style={{
                  fontSize: isGoldenUnclaimed ? '17px' : '19px',
                  fontWeight: 900,
                  fill: isGoldenUnclaimed ? 'hsl(195, 42%, 18%)' : isClaimed ? '#ffffff' : 'hsl(40, 100%, 95%)',
                  pointerEvents: 'none',
                  textShadow: isClaimed ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
                }}
              >
                {cell.letter}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default HexBoard;
