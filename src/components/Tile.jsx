import { BRANCH_MAP } from "../data/branches";

export default function Tile({ cell, size }){
  const branch = BRANCH_MAP[cell.value];
  const Icon = branch.icon;
  const iconSize = Math.max(16, Math.floor(size * 0.3));
  const nameSize = size < 85 ? 8 : size < 110 ? 10 : 11.5;
  const deptSize = size < 85 ? 5.5 : 6.5;

  return (
    <div style={{
      width:"100%", height:"100%", background:branch.flat, borderRadius:9,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2,
      border:`2px solid ${branch.border}`,
      boxShadow:"0 2px 4px rgba(0,0,0,0.12),0 4px 12px rgba(0,0,0,0.08)",
      animation: cell.isMerged ? "stampSlam 0.4s cubic-bezier(.21,1.5,.65,1)" : cell.isNew ? "tileAppear 0.22s ease-out" : "none",
      position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%) rotate(3deg)", width:size*0.8, height:size*0.8, borderRadius:"50%", border:"1.5px dashed rgba(255,255,255,0.25)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", inset:0, borderRadius:8, background:"radial-gradient(ellipse at 50% 50%,transparent 50%,rgba(0,0,0,0.15) 100%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"40%", background:"linear-gradient(180deg,rgba(255,255,255,0.1),transparent)", borderRadius:"9px 9px 0 0", pointerEvents:"none" }}/>
      <Icon size={iconSize} color={branch.fg} strokeWidth={2.2} style={{ position:"relative", zIndex:2, filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.25))" }}/>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:nameSize, color:branch.fg, letterSpacing:1, textShadow:"0 1px 2px rgba(0,0,0,0.3)", position:"relative", zIndex:2, lineHeight:1 }}>
        {branch.short}
      </span>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:deptSize, color:`${branch.fg}60`, letterSpacing:2, position:"relative", zIndex:2, lineHeight:1, textTransform:"uppercase" }}>
        dept
      </span>
      {branch.isCS && <span style={{ position:"absolute", top:4, right:6, fontSize:12, color:branch.fg, zIndex:3 }}>♛</span>}
      {cell.isMerged && (
        <div style={{ position:"absolute", inset:0, borderRadius:9, background:"radial-gradient(circle,rgba(255,255,255,0.55) 0%,transparent 70%)", animation:"inkRipple 0.4s ease-out forwards", pointerEvents:"none", zIndex:4 }}/>
      )}
    </div>
  );
}
