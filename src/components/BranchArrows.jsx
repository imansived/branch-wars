import { BRANCHES, BRANCH_MAP } from "../data/branches";
import UnlockToast from "./UnlockToast";

export default function BranchArrows({ highestValue, flashId }){
  const currentBranch = BRANCHES[Math.min(highestValue, 8) - 1] || BRANCHES[7];

  return (
    <div style={{ marginBottom:12, fontFamily:"'DM Sans',sans-serif", position:"relative" }}>
      <UnlockToast branch={flashId ? BRANCH_MAP[flashId] : null}/>

      <div style={{
        background:"linear-gradient(155deg,rgba(255,255,255,0.55),rgba(255,255,255,0.22))",
        border:"1px solid rgba(255,255,255,0.5)", borderRadius:14, padding:"9px 10px 8px",
        boxShadow:"0 4px 16px rgba(60,40,10,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
        backdropFilter:"blur(2px)",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
          <span style={{ fontSize:8, fontWeight:800, color:"#9A7848", letterSpacing:2.5, textTransform:"uppercase" }}>Progression</span>
          <span style={{
            fontSize:8.5, fontWeight:800, letterSpacing:0.5,
            color:currentBranch.fg, background:currentBranch.flat,
            border:`1px solid ${currentBranch.border}`, borderRadius:20, padding:"2px 9px",
            boxShadow:`0 2px 6px ${currentBranch.glow}`,
          }}>
            {highestValue >= 8 ? "♛ CS" : currentBranch.name}
          </span>
        </div>

        <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
          <div style={{ display:"flex", alignItems:"center", gap:0, width:"max-content", minWidth:"100%", justifyContent:"space-between" }}>
            {BRANCHES.map((b, i) => {
              const achieved = highestValue > b.id;
              const current = highestValue === b.id;
              const Icon = b.icon;
              const isLast = i === BRANCHES.length - 1;
              const isFlash = flashId === b.id;

              return (
                <div key={b.id} style={{ display:"flex", alignItems:"center", flex: isLast ? "0 0 auto" : "1 1 auto" }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, flexShrink:0 }}>
                    <div style={{
                      width: current ? 30 : achieved ? 24 : 20,
                      height: current ? 30 : achieved ? 24 : 20,
                      borderRadius:"50%",
                      background: current || achieved ? `linear-gradient(155deg, ${b.flat}, ${b.border})` : "rgba(255,255,255,0.5)",
                      border:`${current ? 2.5 : achieved ? 2 : 1.5}px solid ${current || achieved ? b.border : "rgba(190,170,130,0.4)"}`,
                      boxShadow: current
                        ? `0 0 0 4px ${b.flat}25, 0 3px 10px ${b.glow}`
                        : achieved ? "0 2px 6px rgba(0,0,0,0.12)" : "inset 0 1px 2px rgba(0,0,0,0.04)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all 0.45s cubic-bezier(.21,1.5,.65,1)",
                      animation: isFlash ? "nodePop 0.9s cubic-bezier(.21,1.5,.65,1)" : "none",
                      position:"relative",
                    }}>
                      {(current || achieved)
                        ? <Icon size={current ? 14 : 10} color={b.fg} strokeWidth={2.5}/>
                        : <div style={{ width:4, height:4, borderRadius:"50%", background:"rgba(160,140,100,0.45)" }}/>
                      }
                      {b.isCS && current && (
                        <span style={{ position:"absolute", top:-9, fontSize:11, lineHeight:1, filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.2))" }}>♛</span>
                      )}
                      {isFlash && (
                        <div style={{ position:"absolute", inset:-6, borderRadius:"50%", border:`2px solid ${b.flat}`, animation:"ringExpand 0.9s ease-out forwards", pointerEvents:"none" }}/>
                      )}
                    </div>
                    <span style={{
                      fontSize: current ? 7 : 6.5,
                      fontWeight: current ? 800 : achieved ? 700 : 600,
                      color: current ? b.flat : achieved ? `${b.flat}DD` : "rgba(160,140,100,0.55)",
                      letterSpacing:0.3, whiteSpace:"nowrap", transition:"color 0.4s",
                    }}>{b.short}</span>
                  </div>

                  {!isLast && (
                    <div style={{ flex:1, display:"flex", alignItems:"center", margin:"0 2px", marginBottom:12, minWidth:14 }}>
                      <div style={{
                        flex:1, height:2.5, borderRadius:2,
                        background: achieved ? `linear-gradient(90deg, ${b.flat}, ${BRANCHES[i+1].flat})` : "rgba(200,185,150,0.4)",
                        transition:"background 0.5s",
                        boxShadow: achieved ? `0 0 6px ${b.glow}` : "none",
                      }}/>
                      <div style={{
                        width:0, height:0, flexShrink:0,
                        borderTop:"4.5px solid transparent", borderBottom:"4.5px solid transparent",
                        borderLeft:`6px solid ${achieved ? BRANCHES[i+1].flat : "rgba(200,185,150,0.4)"}`,
                        transition:"border-color 0.5s",
                        filter: achieved ? `drop-shadow(0 0 3px ${BRANCHES[i+1].glow})` : "none",
                      }}/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
