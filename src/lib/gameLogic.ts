// ============================
// Game Logic: Board generation, hex adjacency, BFS win detection, golden question
// ============================
import { getQuestionForLetter } from './questionsDB';
export { getQuestionForLetter };

export type CellStatus = 'unclaimed' | 'team1' | 'team2';

export interface HexCell {
  index: number;
  row: number;
  col: number;
  letter: string;
  status: CellStatus;
  isWinningPath?: boolean;
  isGolden?: boolean; // Golden question - free point
}

export interface GameState {
  board: HexCell[];
  currentTurn: 'team1' | 'team2';
  winner: 'team1' | 'team2' | null;
  winningPath: number[];
  team1Score: number;
  team2Score: number;
  team1Name: string;
  team2Name: string;
  team1Color: 'terracotta' | 'blue';
  team2Color: 'terracotta' | 'blue';
}

// Arabic letters used in the game
export const ARABIC_LETTERS = [
  'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر',
  'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف',
  'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي',
];

/** Generate a random 5x5 hex board with 1-2 golden cells */
export function generateBoard(): HexCell[] {
  const board: HexCell[] = [];
  const shuffled = [...ARABIC_LETTERS].sort(() => Math.random() - 0.5);

  // Pick 1-2 random indices for golden questions
  const goldenCount = Math.random() > 0.5 ? 2 : 1;
  const goldenIndices = new Set<number>();
  while (goldenIndices.size < goldenCount) {
    goldenIndices.add(Math.floor(Math.random() * 25));
  }

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;
      board.push({
        index,
        row,
        col,
        letter: shuffled[index % shuffled.length],
        status: 'unclaimed',
        isGolden: goldenIndices.has(index),
      });
    }
  }
  return board;
}

/** Get neighbors of a hex cell in an offset hex grid (odd-r offset) */
export function getHexNeighbors(row: number, col: number, gridSize: number = 5): [number, number][] {
  const neighbors: [number, number][] = [];
  const isOddRow = row % 2 === 1;

  const directions = isOddRow
    ? [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]]
    : [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]];

  for (const [dr, dc] of directions) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
      neighbors.push([nr, nc]);
    }
  }
  return neighbors;
}

/**
 * BFS win detection.
 * Team 1 wins by connecting top to bottom.
 * Team 2 wins by connecting left to right.
 */
export function checkWin(board: HexCell[], team: 'team1' | 'team2'): number[] | null {
  const gridSize = 5;
  const teamCells = board.filter(c => c.status === team);
  if (teamCells.length < gridSize) return null;

  const startCells = teamCells.filter(c =>
    team === 'team1' ? c.row === 0 : c.col === 0
  );

  if (startCells.length === 0) return null;

  const visited = new Set<number>();
  const parent = new Map<number, number>();
  const queue: HexCell[] = [];

  for (const cell of startCells) {
    visited.add(cell.index);
    queue.push(cell);
    parent.set(cell.index, -1);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const reached = team === 'team1' ? current.row === gridSize - 1 : current.col === gridSize - 1;
    if (reached) {
      const path: number[] = [];
      let idx = current.index;
      while (idx !== -1) {
        path.push(idx);
        idx = parent.get(idx) ?? -1;
      }
      return path;
    }

    const neighbors = getHexNeighbors(current.row, current.col, gridSize);
    for (const [nr, nc] of neighbors) {
      const ni = nr * gridSize + nc;
      const neighborCell = board[ni];
      if (neighborCell && neighborCell.status === team && !visited.has(ni)) {
        visited.add(ni);
        parent.set(ni, current.index);
        queue.push(neighborCell);
      }
    }
  }

  return null;
}

/** Create initial game state */
export function createInitialGameState(): GameState {
  return {
    board: generateBoard(),
    currentTurn: 'team1',
    winner: null,
    winningPath: [],
    team1Score: 0,
    team2Score: 0,
    team1Name: 'الفريق الأول',
    team2Name: 'الفريق الثاني',
    team1Color: 'terracotta',
    team2Color: 'blue',
  };
}
