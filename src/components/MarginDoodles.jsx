const LEFT_ITEMS = [
  { y:"6%", rot:-4, type:"math", text:"∫eˣdx = eˣ+C" },
  { y:"16%", rot:3, type:"stat", text:"CGPA target: 8.5\nActual: 6.2" },
  { y:"28%", rot:-5, type:"code", text:"while(alive){\n  study();\n}" },
  { y:"40%", rot:4, type:"circuit" },
  { y:"52%", rot:-3, type:"notice", text:"Lab submit:\n✗ not done" },
  { y:"64%", rot:5, type:"code", text:"V = IR" },
  { y:"76%", rot:-4, type:"notice", text:"Viva tmrw\n2PM • Lab-4" },
  { y:"88%", rot:3, type:"sine" },
];

const RIGHT_ITEMS = [
  { y:"6%", rot:5, type:"notice", text:"ATTENDANCE\n62% ⚠ DETAIN" },
  { y:"17%", rot:-4, type:"notice", text:"FEE DUE\n₹48,000" },
  { y:"29%", rot:4, type:"math", text:"dy/dx = ?" },
  { y:"41%", rot:-5, type:"gate" },
  { y:"53%", rot:3, type:"notice", text:"EXAM TMRW\n9AM HALL-3" },
  { y:"65%", rot:-4, type:"code", text:"int main(){\n  return 0;\n}" },
  { y:"77%", rot:5, type:"notice", text:"BACKLOG: 2\nno more pls" },
  { y:"89%", rot:-3, type:"math", text:"∑ regrets = ∞" },
];

const mathStyle = { fontSize:11, fontFamily:"'DM Sans',sans-serif", color:"#7A6240", fontWeight:700, whiteSpace:"pre", lineHeight:1.5 };
const codeStyle = { fontSize:10, fontFamily:"'Courier New',monospace", color:"#6B8A6B", fontWeight:700, whiteSpace:"pre", lineHeight:1.55, background:"rgba(106,138,106,0.08)", padding:"4px 6px", borderRadius:3 };
const noticeStyle = { fontSize:10, fontFamily:"'DM Sans',sans-serif", color:"#A85A4A", fontWeight:800, whiteSpace:"pre", lineHeight:1.55, background:"rgba(220,150,130,0.10)", border:"1.5px solid rgba(180,90,70,0.18)", padding:"4px 7px", borderRadius:3 };
const statStyle = { fontSize:10, fontFamily:"'DM Sans',sans-serif", color:"#A0825A", fontWeight:700, whiteSpace:"pre", lineHeight:1.55, background:"rgba(220,180,130,0.12)", border:"1.5px solid rgba(180,130,70,0.18)", padding:"4px 7px", borderRadius:3 };

function Circuit(){
  return (
    <svg width="64" height="26" viewBox="0 0 72 30" fill="none" stroke="#A08050" strokeWidth="1.8" opacity="0.5">
      <line x1="0" y1="15" x2="10" y2="15"/><rect x="10" y="9" width="14" height="12" rx="1.5"/>
      <line x1="24" y1="15" x2="34" y2="15"/><circle cx="38" cy="15" r="5"/>
      <line x1="43" y1="15" x2="52" y2="15"/><rect x="52" y="9" width="14" height="12" rx="1.5"/>
      <line x1="66" y1="15" x2="72" y2="15"/>
    </svg>
  );
}

function Sine(){
  return (
    <svg width="70" height="22" viewBox="0 0 80 26" fill="none" stroke="#A0825A" strokeWidth="2" opacity="0.5">
      <path d="M0 13 C10 2 20 2 30 13 S50 24 60 13 S70 2 80 13"/>
    </svg>
  );
}

function Gate(){
  return (
    <svg width="54" height="32" viewBox="0 0 62 38" fill="none" stroke="#8A6FA0" strokeWidth="2" opacity="0.5">
      <line x1="0" y1="10" x2="14" y2="10"/><line x1="0" y1="28" x2="14" y2="28"/>
      <path d="M14 4 L14 34 Q46 34 46 19 Q46 4 14 4Z"/><line x1="46" y1="19" x2="62" y2="19"/>
    </svg>
  );
}

function DoodleItem({ item, side }){
  return (
    <div style={{ position:"absolute", [side]:"2%", top:item.y, transform:`rotate(${item.rot}deg)`, opacity:0.6 }}>
      {item.type === "math" && <div style={mathStyle}>{item.text}</div>}
      {item.type === "code" && <div style={codeStyle}>{item.text}</div>}
      {item.type === "notice" && <div style={noticeStyle}>{item.text}</div>}
      {item.type === "stat" && <div style={statStyle}>{item.text}</div>}
      {item.type === "circuit" && <Circuit/>}
      {item.type === "sine" && <Sine/>}
      {item.type === "gate" && <Gate/>}
    </div>
  );
}

export default function MarginDoodles(){
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      {LEFT_ITEMS.map((item, i) => <DoodleItem key={`l${i}`} item={item} side="left"/>)}
      {RIGHT_ITEMS.map((item, i) => <DoodleItem key={`r${i}`} item={item} side="right"/>)}
    </div>
  );
}
