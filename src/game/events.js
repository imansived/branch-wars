import { SIZE, addRandom, shuffleGrid } from "./gridLogic";
import { BRANCH_MAP } from "../data/branches";

const HAS_EFFECT_CHANCE_MIN = 0.30;
const HAS_EFFECT_CHANCE_RANGE = 0.10; // total chance: 30-40%

export function rollHasEffect(){
  return Math.random() < (HAS_EFFECT_CHANCE_MIN + Math.random() * HAS_EFFECT_CHANCE_RANGE);
}

/**
 * Applies a college event's gameplay effect to a grid.
 * Returns { grid, resultMsg, scoreBonus, shouldShake }.
 * Pure aside from Math.random() — does not touch React state directly.
 */
export function applyCollegeEvent(grid, event, currentHighest){
  let ng = grid.map(r => r.map(c => c ? { ...c, isMerged:false, isNew:false } : c));
  let resultMsg = "";
  let scoreBonus = 0;
  let shouldShake = false;

  if(event.effect === "attendance"){
    // Fairness: don't punish a single hard-earned top tile. If there's only one
    // tile at the current highest tier, target the second-highest tier instead.
    const topCells = [];
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(ng[r][c]?.value===currentHighest) topCells.push([r,c]);

    let targetTier = currentHighest;
    let targetCells = topCells;
    if(topCells.length<=1 && currentHighest>2){
      const secondTier = currentHighest-1;
      const secondCells = [];
      for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(ng[r][c]?.value===secondTier) secondCells.push([r,c]);
      if(secondCells.length){ targetTier = secondTier; targetCells = secondCells; }
    }

    if(targetCells.length && targetTier>1){
      const [r,c] = targetCells[Math.floor(Math.random()*targetCells.length)];
      ng[r][c] = { ...ng[r][c], value: targetTier-1, isMerged: true };
      resultMsg = `${BRANCH_MAP[targetTier].name} → ${BRANCH_MAP[targetTier-1].name}. Demoted. 📉`;
    } else {
      resultMsg = "Attendance noted, but nothing to demote yet.";
    }

  } else if(event.effect === "internal"){
    const targetVal = Math.min(currentHighest+1, 8);
    const cells = [];
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(ng[r][c]) cells.push([r,c]);
    if(cells.length){
      const [r,c] = cells[Math.floor(Math.random()*cells.length)];
      ng[r][c] = { ...ng[r][c], value: targetVal, isMerged: true };
      resultMsg = `A tile jumped straight to ${BRANCH_MAP[targetVal].name}! ⭐`;
    }

  } else if(event.effect === "lab"){
    scoreBonus = 100;
    resultMsg = "+100 score added. 📄";

  } else if(event.effect === "faculty"){
    shouldShake = true;
    ng = shuffleGrid(ng);
    resultMsg = "Board reshuffled completely. 😵";

  } else if(event.effect === "placement"){
    // Reward scales with progress: spawn a tile at (highest - 2), not a flat level-1.
    const bonusVal = Math.max(1, currentHighest-2);
    const before = ng;
    ng = addRandom(ng);
    if(ng === before){
      resultMsg = "Board's full — placement cell workshop postponed. 💼";
    } else {
      let placed = false;
      for(let r=0;r<SIZE && !placed;r++) for(let c=0;c<SIZE && !placed;c++){
        if(ng[r][c]?.isNew){ ng[r][c] = { ...ng[r][c], value: bonusVal, isMerged: true }; placed = true; }
      }
      resultMsg = `Free ${BRANCH_MAP[bonusVal].name} tile dropped onto the board! 💼`;
    }
  }

  return { grid: ng, resultMsg, scoreBonus, shouldShake };
}
