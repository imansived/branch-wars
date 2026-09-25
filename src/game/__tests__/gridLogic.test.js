import { describe, it, expect } from "vitest";
import { SIZE, emptyGrid, addRandom, moveGrid, hasMovesLeft, initGame, getHighest } from "../gridLogic";

function cell(value) {
  return { id: Math.random().toString(36).slice(2), value, isNew: false, isMerged: false };
}

function gridFrom(rows) {
  return rows.map(row => row.map(v => (v == null ? null : cell(v))));
}

function values(grid) {
  return grid.map(row => row.map(c => c?.value ?? null));
}

describe("moveGrid", () => {
  it("slides tiles to the near edge without merging mismatched values", () => {
    const grid = gridFrom([
      [null, 1, null, 2],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    const { grid: next, moved, score } = moveGrid(grid, "left");
    expect(moved).toBe(true);
    expect(score).toBe(0);
    expect(values(next)[0]).toEqual([1, 2, null, null]);
  });

  it("merges two equal tiles into one of the next value and scores it", () => {
    const grid = gridFrom([
      [1, 1, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    const { grid: next, moved, score, merged } = moveGrid(grid, "left");
    expect(moved).toBe(true);
    expect(values(next)[0]).toEqual([2, null, null, null]);
    expect(score).toBe(2);
    expect(merged).toEqual([2]);
  });

  it("only merges once per move (1,1,1,1 -> 2,2,not 4)", () => {
    const grid = gridFrom([[1, 1, 1, 1], [null, null, null, null], [null, null, null, null], [null, null, null, null]]);
    const { grid: next } = moveGrid(grid, "left");
    expect(values(next)[0]).toEqual([2, 2, null, null]);
  });

  it("reports moved:false when a move changes nothing", () => {
    const grid = gridFrom([[1, 2, 3, 4], [null, null, null, null], [null, null, null, null], [null, null, null, null]]);
    const { moved } = moveGrid(grid, "left");
    expect(moved).toBe(false);
  });

  it("moves vertically the same way it moves horizontally", () => {
    const grid = gridFrom([[1, null, null, null], [null, null, null, null], [null, null, null, null], [1, null, null, null]]);
    const { grid: next, score } = moveGrid(grid, "up");
    expect(values(next).map(r => r[0])).toEqual([2, null, null, null]);
    expect(score).toBe(2);
  });
});

describe("hasMovesLeft", () => {
  it("is true when the board has empty cells", () => {
    expect(hasMovesLeft(emptyGrid())).toBe(true);
  });

  it("is true when a full board still has an adjacent equal pair", () => {
    const grid = gridFrom([
      [1, 2, 1, 2],
      [2, 1, 2, 1],
      [1, 2, 1, 1],
      [2, 1, 2, 1],
    ]);
    expect(hasMovesLeft(grid)).toBe(true);
  });

  it("is false when the board is full with no adjacent equal values", () => {
    const grid = gridFrom([
      [1, 2, 1, 2],
      [2, 1, 2, 1],
      [1, 2, 1, 2],
      [2, 1, 2, 1],
    ]);
    expect(hasMovesLeft(grid)).toBe(false);
  });
});

describe("addRandom", () => {
  it("adds exactly one value:1 tile into an empty cell", () => {
    const before = emptyGrid();
    const after = addRandom(before);
    let filled = 0;
    for (const row of after) for (const c of row) if (c) { filled++; expect(c.value).toBe(1); }
    expect(filled).toBe(1);
  });

  it("returns the grid unchanged when there is no room", () => {
    const full = gridFrom(Array.from({ length: SIZE }, () => Array(SIZE).fill(1)));
    const after = addRandom(full);
    expect(values(after)).toEqual(values(full));
  });
});

describe("initGame", () => {
  it("starts with exactly two tiles on the board", () => {
    const grid = initGame();
    let count = 0;
    for (const row of grid) for (const c of row) if (c) count++;
    expect(count).toBe(2);
    expect(getHighest(grid)).toBeGreaterThanOrEqual(1);
  });
});
