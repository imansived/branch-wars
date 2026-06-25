import { RefreshCw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

import { useGameState } from "./hooks/useGameState";

import FrontPage from "./components/FrontPage";
import MarginDoodles from "./components/MarginDoodles";
import Grid from "./components/Grid";
import BranchArrows from "./components/BranchArrows";
import Footer from "./components/Footer";
import EventBanner from "./components/EventBanner";
import WelcomeBanner from "./components/WelcomeBanner";
import CSUnlockedBanner from "./components/CSUnlockedBanner";
import WinScreen from "./components/WinScreen";
import GameOverScreen from "./components/GameOverScreen";
import KTToast from "./components/KTToast";

import { fmtNum } from "./utils/helpers";

export default function App(){
  const {
    screen, startGame,
    showWelcome, setShowWelcome,
    showCSBanner, setShowCSBanner,
    grid, score, best, gameState, popups,
    highestValue, flashId,
    activeEvent, eventResult, setActiveEvent, setEventResult,
    shaking, ktUsed, ktToast, muted, toggleMute, hasSnapshot, dismissKtToast,
    TILE, GAP, gridW,
    handleMove, clearBacklog, restart,
    onTouchStart, onTouchEnd,
  } = useGameState();

  if(screen === "front") return <FrontPage onStart={startGame}/>;

  return (
    <>
      <MarginDoodles/>

      {/* Punch holes — left edge of the page */}
      <div style={{ position:"fixed", left:14, top:0, bottom:0, width:24, zIndex:2, pointerEvents:"none", display:"flex", flexDirection:"column", justifyContent:"space-between", alignItems:"center", paddingTop:"20vh", paddingBottom:"20vh" }}>
        {[0,1].map(i => (
          <div key={i} style={{ width:18, height:18, borderRadius:"50%", background:"#FAF6EC", border:"1.5px solid #D8CBA8", boxShadow:"inset 0 2px 5px rgba(120,90,40,0.16)" }}/>
        ))}
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          minHeight:"100vh", background:"#F7F1E1",
          backgroundImage:`
            linear-gradient(rgba(120,150,190,0.14) 1px,transparent 1px),
            linear-gradient(90deg,rgba(120,150,190,0.14) 1px,transparent 1px),
            linear-gradient(rgba(120,150,190,0.05) 1px,transparent 1px),
            linear-gradient(90deg,rgba(120,150,190,0.05) 1px,transparent 1px)
          `,
          backgroundSize:"22px 22px,22px 22px,5.5px 5.5px,5.5px 5.5px",
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"32px 24px 32px 56px", fontFamily:"'DM Sans',sans-serif",
          userSelect:"none", position:"relative",
        }}
      >
        <div style={{ width:gridW, maxWidth:"calc(100vw - 80px)", position:"relative", zIndex:1 }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14, flexWrap:"wrap", gap:10 }}>
            <div>
              <div style={{ fontSize:26, fontWeight:900, lineHeight:1, fontFamily:"'Caveat',cursive", color:"#1a0a00", letterSpacing:1 }}>
                Branch<span style={{ color:"#C0392B" }}> Wars</span>
              </div>
              <div style={{ color:"#A08050", fontSize:8, letterSpacing:2, fontWeight:600, textTransform:"uppercase", marginTop:3 }}>
                merge your way to CS ♛
              </div>
            </div>

            <div style={{ display:"flex", gap:6, alignItems:"flex-start" }}>
              {[["SCORE", score, "#1a0a00"], ["BEST", best, "#8a6a30"]].map(([lbl, val, tc]) => (
                <div key={lbl} style={{ background:"rgba(255,254,248,0.9)", border:"1.5px solid #E0D4B8", borderRadius:8, padding:"6px 12px", textAlign:"center", minWidth:54, boxShadow:"0 2px 6px rgba(90,60,20,0.06)" }}>
                  <div style={{ color:"#A08050", fontSize:7, letterSpacing:2, textTransform:"uppercase", marginBottom:1, fontWeight:700 }}>{lbl}</div>
                  <div style={{ color:tc, fontWeight:800, fontSize:15 }}>{fmtNum(val)}</div>
                </div>
              ))}

              {!ktUsed && (
                <button
                  onClick={clearBacklog}
                  disabled={gameState === "playing" && !hasSnapshot}
                  title="Undo last move or clear a locked board — once per game"
                  style={{
                    background:"rgba(255,254,248,0.9)", border:"1.5px solid #E0D4B8", borderRadius:8,
                    padding:"6px 12px", cursor:(gameState === "playing" && !hasSnapshot) ? "not-allowed" : "pointer",
                    boxShadow:"0 2px 6px rgba(90,60,20,0.06)", textAlign:"center", minWidth:54,
                    opacity:(gameState === "playing" && !hasSnapshot) ? 0.4 : 1,
                    fontFamily:"'DM Sans',sans-serif",
                  }}
                  onMouseDown={e => { if(!(gameState === "playing" && !hasSnapshot)) e.currentTarget.style.transform = "scale(0.93)"; }}
                  onMouseUp={e => { e.currentTarget.style.transform = ""; }}
                >
                  <div style={{ color:"#A08050", fontSize:7, letterSpacing:2, textTransform:"uppercase", marginBottom:1, fontWeight:700 }}>BACKLOG</div>
                  <div style={{ color:"#C0392B", fontWeight:800, fontSize:15 }}>📋</div>
                </button>
              )}

              <button onClick={restart} style={{ background:"rgba(255,254,248,0.9)", border:"1.5px solid #E0D4B8", borderRadius:8, padding:"8px 9px", cursor:"pointer", color:"#8a6a30", lineHeight:0, boxShadow:"0 2px 6px rgba(90,60,20,0.06)" }}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.93)"}
                onMouseUp={e => e.currentTarget.style.transform = ""}
              >
                <RefreshCw size={14}/>
              </button>

              <button onClick={toggleMute} title={muted ? "Unmute sound" : "Mute sound"} style={{ background:"rgba(255,254,248,0.9)", border:"1.5px solid #E0D4B8", borderRadius:8, padding:"8px 9px", cursor:"pointer", color:"#8a6a30", lineHeight:0, boxShadow:"0 2px 6px rgba(90,60,20,0.06)" }}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.93)"}
                onMouseUp={e => e.currentTarget.style.transform = ""}
              >
                {muted ? <VolumeX size={14}/> : <Volume2 size={14}/>}
              </button>
            </div>
          </div>

          {/* Premium arrow progression with unlock toast */}
          <div style={{ marginBottom:14 }}>
            <BranchArrows highestValue={highestValue} flashId={flashId}/>
          </div>

          {/* HERO: board */}
          <div style={{ display:"flex", justifyContent:"center", padding:"10px 0" }}>
            <Grid grid={grid} tileSize={TILE} gap={GAP} popups={popups} shaking={shaking}/>
          </div>

          {/* Controls hint */}
          <div style={{ marginTop:10, display:"flex", gap:3, alignItems:"center", justifyContent:"center", color:"#A08050", fontSize:9, letterSpacing:1, fontWeight:600, opacity:0.8 }}>
            <ChevronLeft size={10}/><ChevronUp size={10}/><ChevronDown size={10}/><ChevronRight size={10}/>
            <span style={{ marginLeft:3 }}>arrow keys or swipe</span>
          </div>

          <Footer/>
        </div>
      </div>

      <EventBanner event={activeEvent} resultText={eventResult} onDone={() => { setActiveEvent(null); setEventResult(null); }}/>
      {showWelcome && <WelcomeBanner onDone={() => setShowWelcome(false)}/>}
      {showCSBanner && <CSUnlockedBanner onDone={() => setShowCSBanner(false)}/>}
      {gameState === "won" && <WinScreen score={score} onRestart={restart}/>}
      {ktToast && <KTToast onDone={dismissKtToast}/>}
      {gameState === "over" && <GameOverScreen score={score} onRestart={restart} onClearBacklog={clearBacklog} ktAvailable={!ktUsed}/>}
    </>
  );
}
