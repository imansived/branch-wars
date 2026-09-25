"""
Pure-Python port of the Branch Wars board logic and AI solver.

This mirrors src/game/gridLogic.js and src/ai/solver.js from the web app
exactly (same rotation trick, same slide/merge rule, same expectimax search,
same four heuristics) so that results here say something real about the
game's actual AI, not about a different toy implementation.

The board is a 4x4 list of lists of ints, 0 meaning empty. Tile values are
tiers (1 = Civil ... 8 = CS ... 9 = "Ultimate Package", which ends the game).
"""

import random

SIZE = 4
DIRECTIONS = ("up", "down", "left", "right")

DEFAULT_WEIGHTS = {
    "empty": 2.7,
    "monotonicity": 1.0,
    "smoothness": 0.1,
    "corner": 2.0,
}


# ─── board primitives (mirrors gridLogic.js) ────────────────────────────────

def empty_grid():
    return [[0] * SIZE for _ in range(SIZE)]


def empty_cells(grid):
    return [(r, c) for r in range(SIZE) for c in range(SIZE) if grid[r][c] == 0]


def add_random_tile(grid, rng):
    cells = empty_cells(grid)
    if not cells:
        return grid
    r, c = rng.choice(cells)
    next_grid = [row[:] for row in grid]
    next_grid[r][c] = 1
    return next_grid


def init_game(rng):
    grid = add_random_tile(empty_grid(), rng)
    return add_random_tile(grid, rng)


def has_moves_left(grid):
    for r in range(SIZE):
        for c in range(SIZE):
            if grid[r][c] == 0:
                return True
            v = grid[r][c]
            if r + 1 < SIZE and grid[r + 1][c] == v:
                return True
            if c + 1 < SIZE and grid[r][c + 1] == v:
                return True
    return False


def _slide_row(row):
    vals = [v for v in row if v]
    result, score, merged = [], 0, []
    i = 0
    while i < len(vals):
        if i + 1 < len(vals) and vals[i] == vals[i + 1]:
            nv = vals[i] + 1
            result.append(nv)
            score += nv
            merged.append(nv)
            i += 2
        else:
            result.append(vals[i])
            i += 1
    result += [0] * (SIZE - len(result))
    return result, score, merged


def _rotate_cw(g):
    return [list(row) for row in zip(*g[::-1])]


def _rotate_ccw(g):
    return [list(row) for row in zip(*g)][::-1]


def move(grid, direction):
    """Returns (new_grid, moved, score_gained, merged_values) — same shape as moveGrid() in gridLogic.js."""
    g = [row[:] for row in grid]
    if direction == "right":
        g = [list(reversed(r)) for r in g]
    if direction == "up":
        g = _rotate_ccw(g)
    if direction == "down":
        g = _rotate_cw(g)

    moved = False
    total_score = 0
    all_merged = []
    for r in range(SIZE):
        new_row, score, merged = _slide_row(g[r])
        if new_row != g[r]:
            moved = True
        g[r] = new_row
        total_score += score
        all_merged.extend(merged)

    if direction == "right":
        g = [list(reversed(r)) for r in g]
    if direction == "up":
        g = _rotate_cw(g)
    if direction == "down":
        g = _rotate_ccw(g)

    return g, moved, total_score, all_merged


# ─── heuristics (mirrors solver.js) ─────────────────────────────────────────

def count_empty(grid):
    return sum(1 for row in grid for v in row if v == 0)


def monotonicity(grid):
    totals = [0, 0, 0, 0]

    for c in range(SIZE):
        current, nxt = 0, 1
        while nxt < SIZE:
            while nxt < SIZE and grid[nxt][c] == 0:
                nxt += 1
            if nxt >= SIZE:
                break
            curr_val, next_val = grid[current][c], grid[nxt][c]
            if curr_val > next_val:
                totals[0] += next_val - curr_val
            elif next_val > curr_val:
                totals[1] += curr_val - next_val
            current, nxt = nxt, nxt + 1

    for r in range(SIZE):
        current, nxt = 0, 1
        while nxt < SIZE:
            while nxt < SIZE and grid[r][nxt] == 0:
                nxt += 1
            if nxt >= SIZE:
                break
            curr_val, next_val = grid[r][current], grid[r][nxt]
            if curr_val > next_val:
                totals[2] += next_val - curr_val
            elif next_val > curr_val:
                totals[3] += curr_val - next_val
            current, nxt = nxt, nxt + 1

    return max(totals[0], totals[1]) + max(totals[2], totals[3])


def smoothness(grid):
    total = 0
    for r in range(SIZE):
        for c in range(SIZE):
            v = grid[r][c]
            if v == 0:
                continue
            if c + 1 < SIZE and grid[r][c + 1] != 0:
                total += abs(v - grid[r][c + 1])
            if r + 1 < SIZE and grid[r + 1][c] != 0:
                total += abs(v - grid[r + 1][c])
    return total


def corner_bonus(grid):
    max_v, pos = 0, None
    for r in range(SIZE):
        for c in range(SIZE):
            if grid[r][c] > max_v:
                max_v, pos = grid[r][c], (r, c)
    if pos is None:
        return 0
    r, c = pos
    is_corner = (r == 0 or r == SIZE - 1) and (c == 0 or c == SIZE - 1)
    return max_v if is_corner else 0


def evaluate(grid, weights):
    return (
        weights["empty"] * count_empty(grid)
        + weights["monotonicity"] * monotonicity(grid)
        - weights["smoothness"] * smoothness(grid)
        + weights["corner"] * corner_bonus(grid)
    )


# ─── expectimax search (mirrors solver.js) ──────────────────────────────────

def adaptive_depth(grid, max_depth=4):
    empty = count_empty(grid)
    depth = 4 if empty <= 3 else 3 if empty <= 6 else 2
    return min(depth, max_depth)


def _max_node(grid, depth, weights):
    if depth <= 0 or not has_moves_left(grid):
        return evaluate(grid, weights)
    best = None
    for d in DIRECTIONS:
        ng, moved, _, _ = move(grid, d)
        if not moved:
            continue
        val = _chance_node(ng, depth, weights)
        if best is None or val > best:
            best = val
    return best if best is not None else evaluate(grid, weights)


def _chance_node(grid, depth, weights):
    cells = empty_cells(grid)
    if not cells:
        return _max_node(grid, depth - 1, weights)
    total = 0.0
    for r, c in cells:
        ng = [row[:] for row in grid]
        ng[r][c] = 1
        total += _max_node(ng, depth - 1, weights)
    return total / len(cells)


def best_move(grid, weights, max_depth=4):
    depth = adaptive_depth(grid, max_depth)
    best_dir, best_val = None, None
    for d in DIRECTIONS:
        ng, moved, score, _ = move(grid, d)
        if not moved:
            continue
        val = _chance_node(ng, depth, weights) + score * 0.1
        if best_val is None or val > best_val:
            best_val, best_dir = val, d
    return best_dir


# ─── full self-play games, for benchmarking a weight set ──────────────────

def play_game(weights, rng, max_depth=4, max_moves=3000):
    grid = init_game(rng)
    score = 0
    moves = 0
    while moves < max_moves:
        d = best_move(grid, weights, max_depth)
        if d is None:
            break
        ng, moved, gained, merged = move(grid, d)
        if not moved:
            break
        score += gained
        grid = add_random_tile(ng, rng)
        moves += 1
        if 9 in merged:
            return _result("won", grid, score, moves)
        if not has_moves_left(grid):
            return _result("over", grid, score, moves)
    return _result("timeout", grid, score, moves)


def _result(outcome, grid, score, moves):
    return {
        "outcome": outcome,
        "score": score,
        "moves": moves,
        "highest": max(v for row in grid for v in row),
    }


if __name__ == "__main__":
    # Quick smoke test: one game with the current hand-tuned weights.
    rng = random.Random(0)
    result = play_game(DEFAULT_WEIGHTS, rng, max_depth=3)
    print(result)
