// ============================
// Game Logic: Board generation, hex adjacency, and BFS win detection
// ============================

export type CellStatus = 'unclaimed' | 'team1' | 'team2';

export interface HexCell {
  index: number;
  row: number;
  col: number;
  letter: string;
  status: CellStatus;
  isWinningPath?: boolean;
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

// Arabic letters commonly used in trivia
export const ARABIC_LETTERS = [
  'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر',
  'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف',
  'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي',
];

// Sample questions database (letter -> questions)
export const SAMPLE_QUESTIONS: Record<string, { question: string; answer: string; category: string }[]> = {
  'أ': [
    { question: 'ما هو أطول نهر في العالم؟', answer: 'أمازون / النيل', category: 'جغرافيا' },
    { question: 'ما هي عاصمة اليابان؟', answer: 'أوساكا لا، طوكيو', category: 'جغرافيا' },
  ],
  'ب': [
    { question: 'ما هو أكبر محيط في العالم؟', answer: 'بحر الهادئ (المحيط الهادئ)', category: 'جغرافيا' },
  ],
  'ت': [
    { question: 'ما هو الحيوان الأسرع في العالم؟', answer: 'تشيتا (الفهد)', category: 'حيوانات' },
  ],
  'ج': [
    { question: 'ما هو أكبر كوكب في المجموعة الشمسية؟', answer: 'جوبيتر (المشتري)', category: 'فضاء' },
  ],
  'ح': [
    { question: 'ما هو العنصر الكيميائي الأكثر وفرة في الكون؟', answer: 'هيدروجين', category: 'علوم' },
  ],
  'خ': [
    { question: 'كم عدد أرجل العنكبوت؟', answer: 'خمسة... لا ثمانية!', category: 'حيوانات' },
  ],
  'د': [
    { question: 'ما هي أقدم حضارة في التاريخ؟', answer: 'دلمون أو سومر', category: 'تاريخ' },
  ],
  'ر': [
    { question: 'ما هي عاصمة إيطاليا؟', answer: 'روما', category: 'جغرافيا' },
  ],
  'س': [
    { question: 'ما هو أكبر صحراء في العالم؟', answer: 'صحراء الصحراء الكبرى', category: 'جغرافيا' },
  ],
  'ش': [
    { question: 'ما هو الشهر الميلادي الثاني؟', answer: 'شباط (فبراير)', category: 'عام' },
  ],
  'ع': [
    { question: 'كم عدد قارات العالم؟', answer: 'عدد ٧ قارات', category: 'جغرافيا' },
  ],
  'غ': [
    { question: 'ما هو الغاز الذي نتنفسه؟', answer: 'غاز الأكسجين', category: 'علوم' },
  ],
  'ف': [
    { question: 'ما هي أكبر دولة في أفريقيا مساحة؟', answer: 'فرنسا لا، الجزائر', category: 'جغرافيا' },
  ],
  'ق': [
    { question: 'ما هو أعلى جبل في العالم؟', answer: 'قمة إيفرست', category: 'جغرافيا' },
  ],
  'ك': [
    { question: 'ما هو أكبر كوكب صخري في المجموعة الشمسية؟', answer: 'كوكب الأرض', category: 'فضاء' },
  ],
  'ل': [
    { question: 'ما هي اللغة الأكثر تحدثاً في العالم؟', answer: 'لغة الماندرين الصينية', category: 'ثقافة' },
  ],
  'م': [
    { question: 'ما هو أصغر دولة في العالم؟', answer: 'مدينة الفاتيكان', category: 'جغرافيا' },
  ],
  'ن': [
    { question: 'ما هو المعدن الأغلى في العالم؟', answer: 'نيوترينو... لا البلاتين أو الذهب', category: 'علوم' },
  ],
  'هـ': [
    { question: 'ما هي عاصمة فنلندا؟', answer: 'هلسنكي', category: 'جغرافيا' },
  ],
  'و': [
    { question: 'ما هي أكبر جزيرة في العالم؟', answer: 'وجرينلاند (غرينلاند)', category: 'جغرافيا' },
  ],
  'ي': [
    { question: 'ما هو البحر الذي يفصل بين أوروبا وأفريقيا؟', answer: 'يُعرف بالبحر الأبيض المتوسط', category: 'جغرافيا' },
  ],
};

/** Generate a random 5x5 hex board */
export function generateBoard(): HexCell[] {
  const board: HexCell[] = [];
  const shuffled = [...ARABIC_LETTERS].sort(() => Math.random() - 0.5);

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;
      board.push({
        index,
        row,
        col,
        letter: shuffled[index % shuffled.length],
        status: 'unclaimed',
      });
    }
  }
  return board;
}

/** Get neighbors of a hex cell in an offset hex grid (odd-r offset) */
export function getHexNeighbors(row: number, col: number, gridSize: number = 5): [number, number][] {
  const neighbors: [number, number][] = [];
  const isOddRow = row % 2 === 1;

  // Hex neighbor offsets for odd-r offset coordinates
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
 * Team 1 wins by connecting top row to bottom row.
 * Team 2 wins by connecting left column to right column.
 */
export function checkWin(board: HexCell[], team: 'team1' | 'team2'): number[] | null {
  const gridSize = 5;
  const teamCells = board.filter(c => c.status === team);
  if (teamCells.length < gridSize) return null;

  // Starting cells: Team1 = top row, Team2 = left col
  const startCells = teamCells.filter(c =>
    team === 'team1' ? c.row === 0 : c.col === 0
  );

  if (startCells.length === 0) return null;

  // BFS from each start cell
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

    // Check if we reached the opposite side
    const reached = team === 'team1' ? current.row === gridSize - 1 : current.col === gridSize - 1;
    if (reached) {
      // Reconstruct path
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

/** Get a random question for a given letter */
export function getQuestionForLetter(letter: string): { question: string; answer: string; category: string } | null {
  const questions = SAMPLE_QUESTIONS[letter];
  if (!questions || questions.length === 0) {
    // Fallback generic question
    return {
      question: `سؤال يبدأ جوابه بحرف "${letter}" - ما هو؟`,
      answer: `الجواب يبدأ بحرف ${letter}`,
      category: 'عام',
    };
  }
  return questions[Math.floor(Math.random() * questions.length)];
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
