import { useEffect } from "react";

export default function CSUnlockedBanner({ onDone }){
  useEffect(() => {
    const t = setTimeout(onDone, 3400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:155,
      display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(40,28,8,0.8)", backdropFilter:"blur(8px)",
      animation:"welcomeFade 3.4s ease-in-out forwards", pointerEvents:"none",
    }}>
      <div style={{ textAlign:"center", animation:"welcomePop 0.6s cubic-bezier(.21,1.5,.65,1)", padding:"0 24px", maxWidth:380 }}>
        <div style={{ fontSize:54, marginBottom:6, filter:"drop-shadow(0 0 16px rgba(232,184,0,0.5))" }}>♛</div>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:900, fontSize:24, letterSpacing:2, color:"#E8B800", textShadow:"3px 3px 0 #3d2800", marginBottom:10 }}>
          CS UNLOCKED
        </div>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#FFE8A0", fontWeight:700, marginBottom:14 }}>
          Congratulations. 🎓
        </div>
        <div style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(255,240,200,0.75)", lineHeight:1.7, fontWeight:600,
          background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,224,160,0.25)", borderRadius:10, padding:"10px 16px",
        }}>
          Now merge two CS tiles<br/>to attend placements.
        </div>
      </div>
    </div>
  );
}
