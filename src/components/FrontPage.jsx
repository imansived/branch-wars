import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { BRANCHES } from "../data/branches";

const FIELDS = [
  { label:"Subject", value:"Tile Merger Simulation Lab" },
  { label:"Roll No.", value:"_________________________" },
  { label:"Department", value:"_________________________" },
  { label:"Batch", value:"_____  Div: _____  Year: _____" },
  { label:"Faculty", value:"_________________________" },
];

export default function FrontPage({ onStart }){
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <div style={{
      minHeight:"100vh", width:"100%", background:"#C8A96E",
      backgroundImage:"radial-gradient(ellipse at 50% 40%,rgba(255,240,200,0.3),transparent 65%),repeating-linear-gradient(45deg,rgba(0,0,0,0.012) 0px,rgba(0,0,0,0.012) 1px,transparent 1px,transparent 10px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px",
      fontFamily:"'DM Sans',sans-serif",
    }}>
      <div style={{
        maxWidth:470, width:"100%",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) rotate(-0.5deg)" : "translateY(24px) rotate(-0.5deg)",
        transition:"opacity 0.5s ease 0.1s,transform 0.65s cubic-bezier(.21,1.5,.65,1) 0.1s",
        display:"flex", filter:"drop-shadow(0 8px 32px rgba(0,0,0,0.25))",
      }}>
        <div style={{
          width:28, flexShrink:0, background:"linear-gradient(90deg,#8B6B3A,#B08040)",
          borderRadius:"5px 0 0 5px", display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"space-between", paddingTop:"28%", paddingBottom:"28%",
          borderRight:"1px solid #C9A060", boxShadow:"inset -2px 0 4px rgba(0,0,0,0.15)",
        }}>
          {[0,1].map(i => (
            <div key={i} style={{ width:15, height:15, borderRadius:"50%", background:"#C8A96E", border:"1.5px solid #7A5520", boxShadow:"inset 0 2px 4px rgba(0,0,0,0.45)" }}/>
          ))}
        </div>

        <div style={{
          flex:1, background:"#FFFEF0", border:"1.5px solid #C9A060", borderLeft:"none",
          borderRadius:"0 6px 6px 0", overflow:"hidden",
          backgroundImage:"repeating-linear-gradient(180deg,transparent,transparent 27px,rgba(100,140,200,0.1) 28px)",
        }}>
          <div style={{ height:8, background:"repeating-linear-gradient(90deg,#FF9933 0,#FF9933 33.33%,#ffffff 33.33%,#ffffff 66.66%,#138808 66.66%,#138808 100%)" }}/>

          <div style={{ padding:"14px 22px 18px" }}>
            <div style={{ textAlign:"center", borderBottom:"1.5px solid #D4B87A", paddingBottom:8, marginBottom:10 }}>
              <div style={{ fontSize:13.5, fontWeight:900, color:"#1A0A5A", lineHeight:1.2, marginBottom:1 }}>D.Y. Patil College of Engineering</div>
              <div style={{ fontSize:9, fontWeight:600, color:"#3A2A00", marginBottom:4 }}>Akurdi, Pune — 411044</div>
              <div style={{ display:"flex", justifyContent:"center", flexWrap:"wrap", gap:"3px 4px" }}>
                {["SPPU Affiliated","NAAC A+ Grade","AICTE Approved","Est. 1984","Autonomous 2024–25"].map(tag => (
                  <span key={tag} style={{ fontSize:7, fontWeight:700, color:"#5A3A00", background:"rgba(200,169,110,0.28)", border:"1px solid rgba(160,120,60,0.28)", borderRadius:3, padding:"1px 5px" }}>{tag}</span>
                ))}
              </div>
            </div>

            <div style={{ textAlign:"center", marginBottom:10 }}>
              <div style={{ fontSize:48, fontWeight:900, lineHeight:1, fontFamily:"'Caveat',cursive", color:"#1a0a00", letterSpacing:1 }}>
                Branch<span style={{ color:"#C0392B" }}> Wars</span>
              </div>
              <div style={{ fontSize:9, color:"#8a6030", marginTop:2, letterSpacing:2.5, fontWeight:600 }}>— PRACTICAL FILE —</div>
            </div>

            <div style={{ marginBottom:10 }}>
              {FIELDS.map((row, i) => (
                <div key={i} style={{ display:"flex", gap:6, alignItems:"baseline", height:26, paddingLeft:3, borderBottom:"1px solid rgba(100,140,200,0.14)" }}>
                  <span style={{ fontSize:8.5, fontWeight:700, color:"#5a3a00", whiteSpace:"nowrap", minWidth:70, lineHeight:"26px" }}>{row.label}:</span>
                  <span style={{ fontSize:10.5, color:"#2a1a00", fontFamily:"'Caveat',cursive", fontWeight:700, lineHeight:"26px" }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", flexWrap:"wrap", gap:"3px 4px", marginBottom:12, justifyContent:"center" }}>
              {BRANCHES.map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.id} style={{ display:"flex", alignItems:"center", gap:4, background:b.flat, borderRadius:20, padding:"3px 10px", boxShadow:`0 2px 8px ${b.glow}`, border:`1.5px solid ${b.border}` }}>
                    <Icon size={9} color={b.fg} strokeWidth={2.5}/>
                    <span style={{ fontSize:7.5, fontWeight:800, color:b.fg, letterSpacing:0.5 }}>{b.short}</span>
                  </div>
                );
              })}
            </div>

            <button onClick={onStart} style={{
              width:"100%", background:"#C0392B", color:"#fff", fontFamily:"'DM Sans',sans-serif",
              fontWeight:800, fontSize:13, letterSpacing:3, textTransform:"uppercase", border:"none",
              borderRadius:5, padding:"13px 0", cursor:"pointer", boxShadow:"0 4px 14px rgba(192,57,43,0.45)",
              display:"flex", alignItems:"center", justifyContent:"center", gap:10,
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(192,57,43,0.6)"}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(192,57,43,0.45)"; e.currentTarget.style.transform = ""; }}
              onMouseDown={e => e.currentTarget.style.transform = "translateY(2px)"}
              onMouseUp={e => e.currentTarget.style.transform = ""}
            >
              <Play size={14} fill="#fff" strokeWidth={0}/>Start Merging<Play size={14} fill="#fff" strokeWidth={0}/>
            </button>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:10, paddingTop:8, borderTop:"1px solid #D4B87A" }}>
              {["Internal Examiner","External Examiner","Date"].map(label => (
                <div key={label} style={{ textAlign:"center" }}>
                  <div style={{ width:86, borderBottom:"1px solid #A08060", marginBottom:2, height:12 }}/>
                  <div style={{ fontSize:6.5, color:"#8a6030", fontWeight:600 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height:6, background:"repeating-linear-gradient(90deg,#FF9933 0,#FF9933 33.33%,#ffffff 33.33%,#ffffff 66.66%,#138808 66.66%,#138808 100%)" }}/>
        </div>
      </div>
    </div>
  );
}
