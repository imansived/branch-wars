export const SIZE = 4;

export function emptyGrid(){
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

export function addRandom(grid){
  const empty = [];
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(!grid[r][c]) empty.push([r,c]);
  if(!empty.length) return grid;
  const [r,c] = empty[Math.floor(Math.random()*empty.length)];
  const next = grid.map(row => [...row]);
  next[r][c] = { id: Math.random().toString(36).slice(2), value: 1, isNew: true, isMerged: false };
  return next;
}

function slideRow(row){
  const vals = row.filter(Boolean);
  const result = [];
  let score = 0, merged = [], i = 0;
  while(i < vals.length){
    if(i+1 < vals.length && vals[i].value === vals[i+1].value){
      const nv = vals[i].value + 1;
      result.push({ id: Math.random().toString(36).slice(2), value: nv, isNew: false, isMerged: true });
      score += nv; merged.push(nv); i += 2;
    } else {
      result.push({ ...vals[i], isMerged: false, isNew: false }); i += 1;
    }
  }
  while(result.length < SIZE) result.push(null);
  return { row: result, score, merged };
}

function rotCW(g){ return g[0].map((_, c) => g.map(r => r[c]).reverse()); }
function rotCCW(g){ return g[0].map((_, c) => g.map(r => r[g.length-1-c])); }

export function moveGrid(grid, dir){
  let totalScore = 0, allMerged = [];
  let g = grid.map(r => [...r]);
  if(dir === "right") g = g.map(r => [...r].reverse());
  if(dir === "up") g = rotCCW(g);
  if(dir === "down") g = rotCW(g);

  let moved = false;
  for(let r=0;r<SIZE;r++){
    const { row, score, merged } = slideRow(g[r]);
    if(JSON.stringify(g[r].map(c=>c?.value??null)) !== JSON.stringify(row.map(c=>c?.value??null))) moved = true;
    g[r] = row; totalScore += score; allMerged.push(...merged);
  }

  if(dir === "right") g = g.map(r => [...r].reverse());
  if(dir === "up") g = rotCW(g);
  if(dir === "down") g = rotCCW(g);

  return { grid: g, score: totalScore, moved, merged: allMerged };
}

export function hasMovesLeft(grid){
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    if(!grid[r][c]) return true;
    const v = grid[r][c].value;
    if(r+1<SIZE && grid[r+1][c]?.value===v) return true;
    if(c+1<SIZE && grid[r][c+1]?.value===v) return true;
  }
  return false;
}

export function initGame(){
  let g = emptyGrid();
  g = addRandom(g);
  return addRandom(g);
}

export function findMergedCell(grid, val){
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++)
    if(grid[r][c]?.value===val && grid[r][c]?.isMerged) return { row: r, col: c };
  return { row: 1, col: 1 };
}

export function shuffleGrid(grid){
  const vals = [];
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(grid[r][c]) vals.push(grid[r][c]);
  // Fisher-Yates
  for(let i=vals.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [vals[i], vals[j]] = [vals[j], vals[i]];
  }
  const next = emptyGrid();
  let idx = 0;
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(idx<vals.length){
    next[r][c] = { ...vals[idx], isNew:false, isMerged:false }; idx += 1;
  }
  return next;
}

export function getHighest(grid){
  let max = 1;
  for(const row of grid) for(const cell of row) if(cell && cell.value > max) max = cell.value;
  return max;
}
