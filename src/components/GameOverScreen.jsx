import { useRef } from "react";
import { RefreshCw } from "lucide-react";
import PaperCard from "./PaperCard";
import { GAMEOVER_ROASTS } from "../data/flavorText";
import { pickRandom, fmtNum } from "../utils/helpers";

export default function GameOverScreen({ score, onRestart, onClearBacklog, ktAvailable }){
  const roast = useRef(pickRandom(GAMEOVER_ROASTS));

  return (
    <div style={{ position:"fixed", inset:0, zIndex:150, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(30,8,8,0.9)", backdropFilter:"blur(10px)", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ textAlign:"center", animation:"slideUp 0.4s ease-out", maxWidth:410, padding:"0 20px", width:"100%" }}>
        <div style={{ fontSize:48, marginBottom:8 }}>💀</div>
        <div style={{ fontSize:22, fontWeight:900, color:"#C03020", letterSpacing:1, textShadow:"3px 3px 0 #7a0000", marginBottom:4 }}>Board Locked</div>
        <div style={{ color:"rgba(255,150,150,0.4)", fontSize:9.5, letterSpacing:2, marginBottom:18 }}>no valid moves remaining</div>
        <PaperCard borderColor="#8B1A1A" accentColor="#C03020">
          <div style={{ color:"#8b0000", fontSize:9, letterSpacing:3, textTransform:"uppercase", marginBottom:10, opacity:0.65 }}>// DETENTION_NOTICE.txt</div>
          <div style={{ color:"#1a0a00", fontSize:13, lineHeight:1.75, fontWeight:600 }}>{roast.current}</div>
          <div style={{ color:"#C03020", fontWeight:800, fontSize:15, marginTop:10 }}>score = {fmtNum(score)};</div>
        </PaperCard>
        {ktAvailable && (
          <button onClick={onClearBacklog} style={{ background:"#1A6B3A", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:11.5, letterSpacing:1.5, textTransform:"uppercase", border:"none", borderRadius:7, padding:"11px 26px", cursor:"pointer", boxShadow:"0 4px 14px rgba(26,107,58,0.4)", marginBottom:10, display:"block", width:"100%" }}
            onMouseDown={e => { e.currentTarget.style.transform = "translateY(2px)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = ""; }}
          >
            📋 Clear Backlog
          </button>
        )}
        <button onClick={onRestart} style={{ background:"#7B1515", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:12, letterSpacing:2, textTransform:"uppercase", border:"none", borderRadius:7, padding:"13px 32px", cursor:"pointer", boxShadow:"0 4px 14px rgba(123,21,21,0.4)" }}
          onMouseDown={e => { e.currentTarget.style.transform = "translateY(2px)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = ""; }}
        >
          <RefreshCw size={12} style={{ display:"inline", marginRight:7, verticalAlign:"middle" }}/>Try Again
        </button>
      </div>
    </div>
  );
}
