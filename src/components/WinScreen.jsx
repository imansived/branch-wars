import { useState, useEffect, useRef } from "react";
import { Trophy, RefreshCw } from "lucide-react";
import Confetti from "./Confetti";
import PaperCard from "./PaperCard";
import { WIN_ROASTS, PLACEMENT_RESULTS } from "../data/flavorText";
import { pickRandom, fmtNum } from "../utils/helpers";

export default function WinScreen({ score, onRestart }){
  const [stage, setStage] = useState(1);
  const roast = useRef(pickRandom(WIN_ROASTS));
  const result = useRef(pickRandom(PLACEMENT_RESULTS));

  useEffect(() => {
    const t1 = setTimeout(() => setStage(2), 1900);
    const t2 = setTimeout(() => setStage(3), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const isGood = result.current.tone === "good";

  return (
    <>
      <Confetti/>
      <div style={{ position:"fixed", inset:0, zIndex:150, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(60,45,10,0.86)", backdropFilter:"blur(10px)", fontFamily:"'DM Sans',sans-serif" }}>
        {stage === 1 ? (
          <div style={{ textAlign:"center", animation:"tileAppear 0.5s cubic-bezier(.21,1.5,.65,1)" }}>
            <div style={{ fontSize:82, animation:"floatBounce 1.1s ease-in-out infinite alternate", lineHeight:1 }}>♛</div>
            <div style={{ fontSize:30, fontWeight:900, letterSpacing:3, marginTop:12, color:"#E8B800", textShadow:"3px 3px 0 #3d2800" }}>YOU REACHED CS!</div>
            <div style={{ color:"rgba(255,240,150,0.4)", fontSize:10, marginTop:6, letterSpacing:3 }}>branch_wars.exe — completed</div>
          </div>
        ) : stage === 2 ? (
          <div style={{ textAlign:"center", animation:"tileAppear 0.5s cubic-bezier(.21,1.5,.65,1)" }}>
            <div style={{ fontSize:46, marginBottom:8 }}>🎓</div>
            <div style={{ fontSize:26, fontWeight:900, letterSpacing:2, color:"#FFE8A0", textShadow:"3px 3px 0 #3d2800" }}>PLACEMENT SEASON<br/>HAS STARTED</div>
            <div style={{ color:"rgba(255,240,150,0.5)", fontSize:11, marginTop:10, letterSpacing:2 }}>one final merge incoming...</div>
            <div style={{ fontSize:28, marginTop:14, fontWeight:900, color:"#E8B800", letterSpacing:4 }}>CS + CS = ?</div>
          </div>
        ) : (
          <div style={{ textAlign:"center", animation:"slideUp 0.45s ease-out", maxWidth:440, padding:"0 20px", width:"100%" }}>
            <Trophy size={36} color="#E8B800" style={{ margin:"0 auto 12px", filter:"drop-shadow(0 0 12px rgba(232,184,0,0.5))" }}/>
            <PaperCard borderColor={isGood ? "#1A6B3A" : "#8B1A1A"} accentColor={isGood ? "#27AE60" : "#C03020"}>
              <div style={{ color:isGood ? "#1A6B3A" : "#8B1A1A", fontSize:9, letterSpacing:3, textTransform:"uppercase", marginBottom:8, opacity:0.7 }}>// PLACEMENT_RESULT.txt</div>
              <div style={{ color:"#1a0a00", fontSize:19, fontWeight:900, marginBottom:8, letterSpacing:0.5 }}>{result.current.title}</div>
              <div style={{ color:"#3a2a10", fontSize:12.5, lineHeight:1.7, fontWeight:600, marginBottom:10 }}>{result.current.desc}</div>
              <div style={{ color:"#9A7B00", fontWeight:800, fontSize:15 }}>final score = {fmtNum(score)};</div>
            </PaperCard>
            <div style={{ color:"rgba(255,240,150,0.5)", fontSize:10, marginBottom:14, fontStyle:"italic" }}>{roast.current}</div>
            <button onClick={onRestart} style={{ background:"#7A6200", color:"#FFF8DC", fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:12, letterSpacing:2, textTransform:"uppercase", border:"none", borderRadius:7, padding:"13px 32px", cursor:"pointer", boxShadow:"0 4px 14px rgba(122,98,0,0.4)" }}
              onMouseDown={e => { e.currentTarget.style.transform = "translateY(2px)"; }}
              onMouseUp={e => { e.currentTarget.style.transform = ""; }}
            >
              <RefreshCw size={12} style={{ display:"inline", marginRight:7, verticalAlign:"middle" }}/>Play Again
            </button>
          </div>
        )}
      </div>
    </>
  );
}
