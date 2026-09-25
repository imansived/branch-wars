import { describe, it, expect } from "vitest";
import { getBestMove, evaluateGrid, DIRECTIONS } from "../solver";
import { moveGrid } from "../../game/gridLogic";

function cell(value) {
  return { id: Math.random().toString(36).slice(2), value, isNew: false, isMerged: false };
}

function gridFrom(rows) {
  return rows.map(row => row.map(v => (v == null ? null : cell(v))));
}

describe("getBestMove", () => {
  it("only ever returns a direction that actually changes the board", () => {
    const grid = gridFrom([
      [1, 2, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    const dir = getBestMove(grid);
    expect(DIRECTIONS).toContain(dir);
    expect(moveGrid(grid, dir).moved).toBe(true);
  });

  it("picks a merge over a move that wastes it (1,1 with a lone 2 nearby)", () => {
    // Left or right both merge the pair on row 0; up/down leave the row
    // untouched since both tiles already sit on the top edge.
    const grid = gridFrom([
      [1, 1, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    const dir = getBestMove(grid);
    expect(["left", "right"]).toContain(dir);
  });

  it("returns null on a fully locked board", () => {
    const grid = gridFrom([
      [1, 2, 1, 2],
      [2, 1, 2, 1],
      [1, 2, 1, 2],
      [2, 1, 2, 1],
    ]);
    expect(getBestMove(grid)).toBeNull();
  });
});

describe("evaluateGrid", () => {
  it("scores an emptier board higher, all else equal", () => {
    const sparse = gridFrom([[1, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]]);
    const packed = gridFrom([[1, 3, 2, 4], [4, 2, 3, 1], [1, 3, 2, 4], [4, 2, 3, 1]]);
    expect(evaluateGrid(sparse)).toBeGreaterThan(evaluateGrid(packed));
  });

  it("rewards keeping the highest tile in a corner", () => {
    const cornered = gridFrom([[4, 1, null, null], [1, null, null, null], [null, null, null, null], [null, null, null, null]]);
    const centered = gridFrom([[null, null, null, null], [null, 4, 1, null], [null, 1, null, null], [null, null, null, null]]);
    expect(evaluateGrid(cornered)).toBeGreaterThan(evaluateGrid(centered));
  });
});
