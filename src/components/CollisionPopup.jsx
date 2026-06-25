import { useEffect } from "react";

export default function CollisionPopup({ text, row, col, tileSize, gap, onDone }){
  useEffect(() => {
    const t = setTimeout(onDone, 4500);
    return () => clearTimeout(t);
  }, [onDone]);

  const cx = gap + col * (tileSize + gap) + tileSize / 2;
  const cy = gap + row * (tileSize + gap) + tileSize / 2;

  return (
    <div style={{
      position:"absolute", left:cx, top:cy, transform:"translate(-50%,-50%)",
      zIndex:80, pointerEvents:"none", animation:"collisionPop 4.5s ease-out forwards",
      width: Math.min(196, tileSize * 2.2),
    }}>
      <div style={{
        background:"rgba(255,254,242,0.97)", border:"1.5px solid #5A3A00", borderRadius:10,
        padding:"11px 14px 10px", position:"relative", zIndex:2,
        boxShadow:"0 4px 24px rgba(0,0,0,0.15)",
        backgroundImage:"repeating-linear-gradient(180deg,transparent,transparent 19px,rgba(100,140,200,0.12) 20px)",
      }}>
        <div style={{ position:"absolute", left:26, top:0, bottom:0, width:1, background:"rgba(200,0,0,0.16)", pointerEvents:"none" }}/>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:12, color:"#1A0800", lineHeight:1.55, position:"relative", zIndex:1, paddingLeft:12 }}>
          {text}
        </div>
        <div style={{ textAlign:"right", fontSize:8, color:"#27AE60", fontWeight:800, marginTop:3, position:"relative", zIndex:1 }}>
          ✓✓ read
        </div>
      </div>
      <div style={{ width:0, height:0, margin:"0 auto", borderLeft:"7px solid transparent", borderRight:"7px solid transparent", borderTop:"9px solid #5A3A00", position:"relative", zIndex:2 }}/>
      <div style={{ width:0, height:0, margin:"-8px auto 0", borderLeft:"5.5px solid transparent", borderRight:"5.5px solid transparent", borderTop:"7.5px solid rgba(255,254,242,0.97)", position:"relative", zIndex:3 }}/>
    </div>
  );
}
