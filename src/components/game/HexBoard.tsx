// ============================
// HexBoard: Rectangular framed board
// - Top/bottom orange filler bands with zig-zag inner edge hugging the hex rows
// - Left/right royal-blue filler bands with jagged inner edge hugging the columns
// - Recessed dark stroke between filler and grid for carved depth
// - Hex tiles with subtle bevel/inner shadow
// ============================
import { motion } from "framer-motion";
import type { HexCell as HexCellType } from "@/lib/gameLogic";
import { getIconByKey } from "@/components/icons/AvatarIcons";

export interface HexBoardPlayer {
  id: string;
  name: string;
  team: 'team1' | 'team2' | string;
  avatar_url?: string | null;
}

interface HexBoardProps {
  board: HexCellType[];
  currentTurn: 'team1' | 'team2';
  team1Color: 'terracotta' | 'blue';
  team2Color: 'terracotta' | 'blue';
  onHexClick: (cell: HexCellType) => void;
  disabled?: boolean;
  players?: HexBoardPlayer[];
  team1Name?: string;
  team2Name?: string;
}

// Royal palette
const PALETTE = {
  terracotta: 'hsl(25, 87%, 58%)',
  terracottaDeep: 'hsl(20, 80%, 42%)',
  blue: 'hsl(222, 70%, 48%)',
  blueDeep: 'hsl(222, 75%, 32%)',
  unclaimedTop: 'hsl(192, 50%, 32%)',
  unclaimedBot: 'hsl(195, 55%, 18%)',
  golden: 'hsl(45, 92%, 55%)',
  goldenDeep: 'hsl(38, 88%, 42%)',
  carve: 'hsl(195, 60%, 8%)', // recessed stroke
  cream: 'hsl(40, 100%, 95%)',
} as const;

// Pointy-top hex geometry
const HEX_SIZE = 38;
const HEX_W = Math.sqrt(3) * HEX_SIZE;
const HEX_H = 2 * HEX_SIZE;
const ROW_H = HEX_H * 0.75;
const GRID_ROWS = 5;
const GRID_COLS = 5;
const FILLER_BAND = 36; // thickness of outer rectangular filler band

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

const HexBoard = ({ board, currentTurn, team1Color, team2Color, onHexClick, disabled, players = [], team1Name, team2Name }: HexBoardProps) => {
  const team1Hex = team1Color === 'terracotta' ? PALETTE.terracotta : PALETTE.blue;
  const team1Deep = team1Color === 'terracotta' ? PALETTE.terracottaDeep : PALETTE.blueDeep;
  const team2Hex = team2Color === 'terracotta' ? PALETTE.terracotta : PALETTE.blue;
  const team2Deep = team2Color === 'terracotta' ? PALETTE.terracottaDeep : PALETTE.blueDeep;

  const currentColor = currentTurn === 'team1' ? team1Hex : team2Hex;

  // Layout
  const sideMargin = 6;
  const ox = FILLER_BAND + sideMargin + HEX_W / 2;
  const oy = FILLER_BAND + sideMargin + HEX_SIZE;

  const gridLeft = ox - HEX_W / 2;
  const gridRight = ox + (GRID_COLS - 1) * HEX_W + HEX_W / 2 + HEX_W / 2; // include odd-row offset
  const gridTop = oy - HEX_SIZE;
  const gridBottom = oy + (GRID_ROWS - 1) * ROW_H + HEX_SIZE;

  const frameLeft = gridLeft - FILLER_BAND - sideMargin;
  const frameRight = gridRight + FILLER_BAND + sideMargin;
  const frameTop = gridTop - FILLER_BAND - sideMargin;
  const frameBottom = gridBottom + FILLER_BAND + sideMargin;
  const svgW = frameRight - frameLeft;
  const svgH = frameBottom - frameTop;

  // ----- Build zig-zag inner edges that hug hex rows/columns -----
  // Top filler: outer = straight line at frameTop; inner = zig-zag along top hex row.
  const topInner: string[] = [];
  for (let col = 0; col < GRID_COLS; col++) {
    const [cx, cy] = hexCenter(0, col, ox, oy);
    // Each top hex contributes its top apex and the two upper shoulder points
    topInner.push(`${cx - HEX_W / 2},${cy - HEX_SIZE / 2}`); // upper-left shoulder
    topInner.push(`${cx},${cy - HEX_SIZE}`);                  // top apex
    topInner.push(`${cx + HEX_W / 2},${cy - HEX_SIZE / 2}`); // upper-right shoulder
  }
  // Reverse so the polygon winds correctly (inner edge then outer)
  const topPath = `M ${frameLeft + 4},${frameTop} L ${frameRight - 4},${frameTop} L ${frameRight - 4},${gridTop + HEX_SIZE / 2} ` +
    topInner.reverse().map((p) => `L ${p}`).join(' ') +
    ` L ${frameLeft + 4},${gridTop + HEX_SIZE / 2} Z`;

  // Bottom filler: mirror of top
  const botInner: string[] = [];
  for (let col = 0; col < GRID_COLS; col++) {
    const [cx, cy] = hexCenter(GRID_ROWS - 1, col, ox, oy);
    botInner.push(`${cx - HEX_W / 2},${cy + HEX_SIZE / 2}`);
    botInner.push(`${cx},${cy + HEX_SIZE}`);
    botInner.push(`${cx + HEX_W / 2},${cy + HEX_SIZE / 2}`);
  }
  const botPath = `M ${frameLeft + 4},${frameBottom} L ${frameRight - 4},${frameBottom} L ${frameRight - 4},${gridBottom - HEX_SIZE / 2} ` +
    botInner.reverse().map((p) => `L ${p}`).join(' ') +
    ` L ${frameLeft + 4},${gridBottom - HEX_SIZE / 2} Z`;

  // Left filler: jagged inner edge hugs ALL hexes whose left side is exposed.
  // For odd rows the leftmost hex is shifted right by HEX_W/2, so the column-0
  // hex on those rows has its full left side exposed AND the column-0 hex on
  // the adjacent even rows still has its bottom-left vertex exposed.
  const leftInner: string[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    const [cx, cy] = hexCenter(row, 0, ox, oy);
    // Three left-edge vertices per hex: upper-shoulder, far-left, lower-shoulder
    leftInner.push(`${cx - HEX_W / 2},${cy - HEX_SIZE / 2}`);
    leftInner.push(`${cx - HEX_W},${cy}`);
    leftInner.push(`${cx - HEX_W / 2},${cy + HEX_SIZE / 2}`);
  }
  const leftPath = `M ${frameLeft},${frameTop} L ${frameLeft},${frameBottom} ` +
    leftInner.reverse().map((p) => `L ${p}`).join(' ') +
    ` Z`;

  // Right filler: mirror of left
  const rightInner: string[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    const [cx, cy] = hexCenter(row, GRID_COLS - 1, ox, oy);
    rightInner.push(`${cx + HEX_W / 2},${cy - HEX_SIZE / 2}`);
    rightInner.push(`${cx + HEX_W},${cy}`);
    rightInner.push(`${cx + HEX_W / 2},${cy + HEX_SIZE / 2}`);
  }
  const rightPath = `M ${frameRight},${frameTop} L ${frameRight},${frameBottom} ` +
    rightInner.reverse().map((p) => `L ${p}`).join(' ') +
    ` Z`;

  return (
  // Players grouped by team for roster display
  const team1Players = players.filter(p => p.team === 'team1');
  const team2Players = players.filter(p => p.team === 'team2');

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {players.length > 0 && (
        <PlayerRoster
          players={team1Players}
          label={team1Name || 'الفريق الأول'}
          accent={team1Hex}
        />
      )}
      <svg
        viewBox={`${frameLeft} ${frameTop} ${svgW} ${svgH}`}
        className="w-full max-w-[640px] md:max-w-[760px] h-auto"
        style={{ filter: 'drop-shadow(0 12px 40px rgba(0,0,0,0.55))' }}
      >
        <defs>
          {/* Vertical orange band gradient */}
          <linearGradient id="topBand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={team1Hex} />
            <stop offset="100%" stopColor={team1Deep} />
          </linearGradient>
          <linearGradient id="botBand" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={team1Hex} />
            <stop offset="100%" stopColor={team1Deep} />
          </linearGradient>
          {/* Horizontal blue band gradient */}
          <linearGradient id="leftBand" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={team2Hex} />
            <stop offset="100%" stopColor={team2Deep} />
          </linearGradient>
          <linearGradient id="rightBand" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor={team2Hex} />
            <stop offset="100%" stopColor={team2Deep} />
          </linearGradient>
          {/* Hex bevel: light from upper-left, dark from lower-right */}
          <linearGradient id="hexBevel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.32)" />
          </linearGradient>
          <radialGradient id="hexUnclaimed" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor={PALETTE.unclaimedTop} />
            <stop offset="100%" stopColor={PALETTE.unclaimedBot} />
          </radialGradient>
          <radialGradient id="hexGolden" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor={PALETTE.golden} />
            <stop offset="100%" stopColor={PALETTE.goldenDeep} />
          </radialGradient>
          <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feFlood floodColor="rgba(0,0,0,0.5)" />
            <feComposite in2="offsetblur" operator="in" />
            <feComposite in2="SourceGraphic" operator="arithmetic" k2="-1" k3="1" />
          </filter>
        </defs>

        {/* Outer rectangular dark plate behind everything (recessed look) */}
        <rect
          x={frameLeft} y={frameTop} width={svgW} height={svgH}
          rx="14"
          fill={PALETTE.carve}
        />

        {/* Filler bands (drawn behind the hex grid, hugging it) */}
        <path d={topPath} fill="url(#topBand)" stroke={PALETTE.carve} strokeWidth="2.5" strokeLinejoin="round" />
        <path d={botPath} fill="url(#botBand)" stroke={PALETTE.carve} strokeWidth="2.5" strokeLinejoin="round" />
        <path d={leftPath} fill="url(#leftBand)" stroke={PALETTE.carve} strokeWidth="2.5" strokeLinejoin="round" />
        <path d={rightPath} fill="url(#rightBand)" stroke={PALETTE.carve} strokeWidth="2.5" strokeLinejoin="round" />

        {/* Subtle highlight strokes on filler bands for "royal" sheen */}
        <path d={topPath} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <path d={botPath} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        <path d={leftPath} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <path d={rightPath} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />

        {/* Outer gold-ish frame line */}
        <rect
          x={frameLeft + 1} y={frameTop + 1} width={svgW - 2} height={svgH - 2}
          rx="13" fill="none"
          stroke="rgba(212,175,90,0.35)" strokeWidth="1.5"
        />

        {/* Main hex grid */}
        {board.map((cell, i) => {
          const [cx, cy] = hexCenter(cell.row, cell.col, ox, oy);
          const isClaimed = cell.status !== 'unclaimed';
          const teamFill = isClaimed
            ? (cell.status === 'team1' ? team1Hex : team2Hex)
            : null;
          const teamDeep = isClaimed
            ? (cell.status === 'team1' ? team1Deep : team2Deep)
            : null;
          const isGoldenUnclaimed = cell.isGolden && !isClaimed;
          const clickable = !isClaimed && !disabled;

          // Build per-hex gradient for claimed cells
          const claimedGradId = isClaimed ? `claimed-${cell.index}` : '';

          return (
            <g
              key={cell.index}
              onClick={() => clickable && onHexClick(cell)}
              style={{ cursor: clickable ? 'pointer' : 'default' }}
            >
              {isClaimed && (
                <defs>
                  <radialGradient id={claimedGradId} cx="50%" cy="35%" r="70%">
                    <stop offset="0%" stopColor={teamFill!} />
                    <stop offset="100%" stopColor={teamDeep!} />
                  </radialGradient>
                </defs>
              )}

              {/* Winning path glow */}
              {cell.isWinningPath && (
                <polygon
                  points={hexPoints(cx, cy, HEX_SIZE + 5)}
                  fill="none"
                  stroke={teamFill || PALETTE.golden}
                  strokeWidth="3"
                  opacity="0.7"
                >
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
                </polygon>
              )}

              {/* Recessed dark base for carved depth */}
              <polygon
                points={hexPoints(cx, cy + 1.5, HEX_SIZE)}
                fill={PALETTE.carve}
                opacity="0.85"
              />

              {/* Main hex body */}
              <motion.polygon
                points={hexPoints(cx, cy, HEX_SIZE - 1.5)}
                fill={isClaimed ? `url(#${claimedGradId})` : isGoldenUnclaimed ? 'url(#hexGolden)' : 'url(#hexUnclaimed)'}
                stroke={PALETTE.carve}
                strokeWidth="1.2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
              />

              {/* Bevel highlight overlay */}
              <polygon
                points={hexPoints(cx, cy, HEX_SIZE - 1.5)}
                fill="url(#hexBevel)"
                opacity="0.45"
                pointerEvents="none"
              />

              {/* Hover highlight */}
              {clickable && (
                <polygon
                  points={hexPoints(cx, cy, HEX_SIZE - 1.5)}
                  fill="transparent"
                  style={{ transition: 'fill 0.2s' }}
                  onMouseEnter={(e) => { (e.target as SVGPolygonElement).style.fill = `${currentColor}40`; }}
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
                  fontSize: isGoldenUnclaimed ? '18px' : '20px',
                  fontWeight: 900,
                  fill: isGoldenUnclaimed ? PALETTE.carve : isClaimed ? '#ffffff' : PALETTE.cream,
                  pointerEvents: 'none',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)',
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
