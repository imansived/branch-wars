import Tile from "./Tile";
import CollisionPopup from "./CollisionPopup";
import { SIZE } from "../game/gridLogic";

export default function Grid({ grid, tileSize, gap, popups, shaking }){
  const W = tileSize * SIZE + gap * (SIZE + 1);

  return (
    <div style={{
      position:"relative", borderRadius:14,
      boxShadow:"0 10px 36px rgba(0,0,0,0.16), 0 3px 10px rgba(0,0,0,0.10)",
      animation: shaking ? "vivaShake 0.5s ease-in-out" : "none",
    }}>
      <div style={{
        position:"relative", width:W, height:W,
        background:"linear-gradient(145deg,#F5F1E4,#EAE3D0)",
        borderRadius:14, padding:gap, border:"1.5px solid #D8CBA5",
        display:"grid",
        gridTemplateColumns:`repeat(${SIZE},${tileSize}px)`,
        gridTemplateRows:`repeat(${SIZE},${tileSize}px)`,
        gap, overflow:"visible",
      }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => (
          <div key={`empty-${i}`} style={{ background:"rgba(255,255,255,0.45)", borderRadius:7, border:"1px solid rgba(180,160,120,0.25)", boxShadow:"inset 0 1px 3px rgba(0,0,0,0.05)" }}/>
        ))}
        {grid.map((row, r) => row.map((cell, c) => cell && (
          <div key={cell.id} style={{
            position:"absolute",
            top: gap + r * (tileSize + gap),
            left: gap + c * (tileSize + gap),
            width: tileSize, height: tileSize,
            transition:"top 0.1s ease,left 0.1s ease",
            zIndex: cell.isMerged ? 3 : 1,
          }}>
            <Tile cell={cell} size={tileSize}/>
          </div>
        )))}
        {popups.map(p => (
          <CollisionPopup key={p.id} text={p.text} row={p.row} col={p.col} tileSize={tileSize} gap={gap} onDone={p.onDone}/>
        ))}
      </div>
    </div>
  );
}
