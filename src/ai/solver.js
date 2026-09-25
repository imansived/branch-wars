// Expectimax search over the board: at each ply the player picks the move
// that maximizes the heuristic value of the resulting position, then the
// "chance" ply averages over every empty cell the game could spawn a new
// tile into (this board only ever spawns value:1, so no 2-vs-4 branching
// like classic 2048 — the chance node is a plain uniform average).
import { SIZE, moveGrid, hasMovesLeft } from "../game/gridLogic";

export const DIRECTIONS = ["up", "down", "left", "right"];

const WEIGHTS = { empty: 2.7, monotonicity: 1.0, smoothness: 0.1, corner: 2.0 };

function countEmpty(grid) {
  let n = 0;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!grid[r][c]) n++;
  return n;
}

function getEmptyCells(grid) {
  const cells = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!grid[r][c]) cells.push([r, c]);
  return cells;
}

function placeTile(grid, r, c) {
  const next = grid.map(row => [...row]);
  next[r][c] = { id: "sim", value: 1, isNew: false, isMerged: false };
  return next;
}

// Rewards rows/columns that read as a consistent increasing or decreasing
// ramp — a monotonic board keeps big tiles from getting boxed in by bigger
// neighbors, which is what actually causes a 2048-style game to lock up.
function monotonicity(grid) {
  const totals = [0, 0, 0, 0];

  for (let c = 0; c < SIZE; c++) {
    let current = 0, next = 1;
    while (next < SIZE) {
      while (next < SIZE && !grid[next][c]) next++;
      if (next >= SIZE) break;
      const currVal = grid[current][c]?.value ?? 0;
      const nextVal = grid[next][c]?.value ?? 0;
      if (currVal > nextVal) totals[0] += nextVal - currVal;
      else if (nextVal > currVal) totals[1] += currVal - nextVal;
      current = next; next++;
    }
  }

  for (let r = 0; r < SIZE; r++) {
    let current = 0, next = 1;
    while (next < SIZE) {
      while (next < SIZE && !grid[r][next]) next++;
      if (next >= SIZE) break;
      const currVal = grid[r][current]?.value ?? 0;
      const nextVal = grid[r][next]?.value ?? 0;
      if (currVal > nextVal) totals[2] += nextVal - currVal;
      else if (nextVal > currVal) totals[3] += currVal - nextVal;
      current = next; next++;
    }
  }

  return Math.max(totals[0], totals[1]) + Math.max(totals[2], totals[3]);
}

// Penalizes sharp value jumps between neighbors — a "smooth" board merges
// more often because adjacent tiles are more likely to match.
function smoothness(grid) {
  let total = 0;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (!grid[r][c]) continue;
    const v = grid[r][c].value;
    if (c + 1 < SIZE && grid[r][c + 1]) total += Math.abs(v - grid[r][c + 1].value);
    if (r + 1 < SIZE && grid[r + 1][c]) total += Math.abs(v - grid[r + 1][c].value);
  }
  return total;
}

// Keeping the highest tile pinned in a corner is the standard 2048 anchor
// strategy — it frees the rest of the board to build up around it.
function cornerBonus(grid) {
  let max = 0, pos = null;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (grid[r][c] && grid[r][c].value > max) { max = grid[r][c].value; pos = [r, c]; }
  }
  if (!pos) return 0;
  const [r, c] = pos;
  const isCorner = (r === 0 || r === SIZE - 1) && (c === 0 || c === SIZE - 1);
  return isCorner ? max : 0;
}

export function evaluateGrid(grid) {
  return (
    WEIGHTS.empty * countEmpty(grid) +
    WEIGHTS.monotonicity * monotonicity(grid) -
    WEIGHTS.smoothness * smoothness(grid) +
    WEIGHTS.corner * cornerBonus(grid)
  );
}

function maxNode(grid, depth) {
  if (depth <= 0 || !hasMovesLeft(grid)) return evaluateGrid(grid);
  let best = -Infinity, any = false;
  for (const dir of DIRECTIONS) {
    const { grid: ng, moved } = moveGrid(grid, dir);
    if (!moved) continue;
    any = true;
    best = Math.max(best, chanceNode(ng, depth));
  }
  return any ? best : evaluateGrid(grid);
}

function chanceNode(grid, depth) {
  const empties = getEmptyCells(grid);
  if (!empties.length) return maxNode(grid, depth - 1);
  let total = 0;
  for (const [r, c] of empties) total += maxNode(placeTile(grid, r, c), depth - 1);
  return total / empties.length;
}

// Search depth adapts to how full the board is: a packed board has fewer
// legal branches per ply, so it can afford to look further ahead in the
// same time budget — and that's exactly when deeper lookahead matters most.
function adaptiveDepth(grid) {
  const empty = countEmpty(grid);
  if (empty <= 3) return 4;
  if (empty <= 6) return 3;
  return 2;
}

export function getBestMove(grid, { depth } = {}) {
  const searchDepth = depth ?? adaptiveDepth(grid);
  let bestDir = null, bestVal = -Infinity;
  for (const dir of DIRECTIONS) {
    const { grid: ng, moved, score } = moveGrid(grid, dir);
    if (!moved) continue;
    const val = chanceNode(ng, searchDepth) + score * 0.1;
    if (val > bestVal) { bestVal = val; bestDir = dir; }
  }
  return bestDir;
}
