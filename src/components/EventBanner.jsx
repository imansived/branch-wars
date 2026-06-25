import { useEffect } from "react";
import { Zap } from "lucide-react";

const TONE_COLORS = {
  bad:      { border:"#8B1A1A", accent:"#C03020", bg:"linear-gradient(155deg,#FFF0E8,#FCDCD0)" },
  good:     { border:"#1A6B3A", accent:"#27AE60", bg:"linear-gradient(155deg,#F0FFF4,#DCFCE7)" },
  shuffle:  { border:"#5B2D8E", accent:"#7C3AED", bg:"linear-gradient(155deg,#F5F0FF,#E8DCFC)" },
};

export default function EventBanner({ event, resultText, onDone }){
  useEffect(() => {
    const t = setTimeout(onDone, 3400);
    return () => clearTimeout(t);
  }, [onDone]);

  if(!event) return null;
  const c = TONE_COLORS[event.tone] || TONE_COLORS.good;

  return (
    <div style={{
      position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
      zIndex:120, animation:"vivaBannerPop 3.4s cubic-bezier(.21,1.2,.65,1) forwards",
      pointerEvents:"none", width:"min(330px,86vw)",
    }}>
      <div style={{
        background:c.bg, border:`2px solid ${c.border}`, borderRadius:14,
        padding:"18px 18px 16px", textAlign:"center",
        boxShadow:`0 12px 40px ${c.accent}55, 0 4px 12px rgba(0,0,0,0.2)`,
        fontFamily:"'DM Sans',sans-serif",
      }}>
        <div style={{ fontSize:9, fontWeight:800, color:c.accent, letterSpacing:3, textTransform:"uppercase", marginBottom:8, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <Zap size={12} fill={c.accent}/> Engineering Event <Zap size={12} fill={c.accent}/>
        </div>
        <div style={{ fontSize:30, marginBottom:4 }}>{event.icon}</div>
        <div style={{ fontSize:17, fontWeight:900, color:"#1a0a00", marginBottom:7, letterSpacing:0.3 }}>{event.title}</div>
        <div style={{ fontSize:12, color:"#5a3a00", lineHeight:1.6, fontWeight:600, marginBottom: resultText ? 10 : 0 }}>{event.desc}</div>
        {resultText && (
          <div style={{
            fontSize:11.5, fontWeight:800, color:c.border,
            background:"rgba(255,255,255,0.6)", border:`1.5px solid ${c.border}33`,
            borderRadius:8, padding:"6px 10px", animation:"resultFadeIn 0.4s ease-out 1.1s both",
          }}>
            {resultText}
          </div>
        )}
      </div>
    </div>
  );
}
