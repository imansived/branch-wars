import { useEffect } from "react";

export default function WelcomeBanner({ onDone }){
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:160,
      display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(40,28,8,0.78)", backdropFilter:"blur(8px)",
      animation:"welcomeFade 2.8s ease-in-out forwards", pointerEvents:"none",
    }}>
      <div style={{ textAlign:"center", animation:"welcomePop 0.6s cubic-bezier(.21,1.5,.65,1)", padding:"0 24px" }}>
        <div style={{ fontSize:34, marginBottom:10 }}>🎓</div>
        <div style={{ fontFamily:"'Caveat',cursive", fontSize:38, fontWeight:800, color:"#FFE8A0", textShadow:"3px 3px 0 #3d2800", lineHeight:1.1 }}>
          Welcome to<br/>Engineering
        </div>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(255,240,200,0.65)", letterSpacing:1.5, marginTop:10, fontWeight:600 }}>
          Civil se CS tak — merge your way through 8 semesters.
        </div>
      </div>
    </div>
  );
}
