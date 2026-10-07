// Each item's x is its own distance (px) from the card edge, not a small
// jitter around one shared point — spread wide (roughly 0 to 260px) so
// items land at genuinely different depths across the whole margin, from
// right up against the board to out near the viewport edge, instead of
// clustering in one strip. y is irregular for the same reason: an evenly
// spaced column reads as a UI sidebar, not stuff scattered in a margin.
// Mixing boxed "sticky note" items with plain handwritten (Caveat) ones and
// pure decoration (coffee stain, pen scribble, asterisk) — several of them
// faint, some bolder — is what sells depth instead of a flat wall of notes.
const LEFT_ITEMS = [
  { y:"3%",  x:210, rot:-6, scale:0.9,  op:0.3,  type:"stain" },
  { y:"9%",  x:60,  rot:-5, scale:1,    op:0.55, type:"math",     text:"∫eˣdx = eˣ+C" },
  { y:"17%", x:160, rot:4,  scale:0.85, op:0.4,  type:"star" },
  { y:"24%", x:10,  rot:3,  scale:1,    op:0.55, type:"notice",   text:"ATTENDANCE\n62% ⚠ DETAIN" },
  { y:"33%", x:230, rot:-7, scale:1,    op:0.4,  type:"code",     text:"git blame life.c" },
  { y:"40%", x:90,  rot:6,  scale:1,    op:0.45, type:"scribble" },
  { y:"48%", x:180, rot:4,  scale:1.1,  op:0.38, type:"circuit" },
  { y:"55%", x:30,  rot:-4, scale:1,    op:0.55, type:"notice",   text:"CGPA target: 8.5\nActual: 6.2" },
  { y:"63%", x:140, rot:-5, scale:0.95, op:0.32, type:"stain" },
  { y:"70%", x:250, rot:-8, scale:0.85, op:0.42, type:"star" },
  { y:"77%", x:60,  rot:5,  scale:1,    op:0.5,  type:"code",     text:"while(alive){\n  study();\n}" },
  { y:"85%", x:190, rot:3,  scale:1,    op:0.4,  type:"sine" },
  { y:"93%", x:20,  rot:-3, scale:1,    op:0.55, type:"notice",   text:"Lab submit:\n✗ not done" },
];

const RIGHT_ITEMS = [
  { y:"4%",  x:40,  rot:6,  scale:1,    op:0.55, type:"notice",   text:"Viva tmrw\n2PM • Lab-4" },
  { y:"12%", x:200, rot:-4, scale:0.9,  op:0.4,  type:"star" },
  { y:"20%", x:90,  rot:-5, scale:1,    op:0.38, type:"scribble" },
  { y:"27%", x:15,  rot:-5, scale:1,    op:0.55, type:"notice",   text:"FEE DUE\n₹48,000" },
  { y:"35%", x:230, rot:5,  scale:1,    op:0.5,  type:"math",     text:"dy/dx = ?" },
  { y:"43%", x:130, rot:-3, scale:0.95, op:0.32, type:"stain" },
  { y:"51%", x:50,  rot:5,  scale:1,    op:0.38, type:"gate" },
  { y:"58%", x:250, rot:-6, scale:1,    op:0.4,  type:"star" },
  { y:"65%", x:20,  rot:-6, scale:1,    op:0.55, type:"notice",   text:"EXAM TMRW\n9AM HALL-3" },
  { y:"73%", x:170, rot:4,  scale:1,    op:0.42, type:"scribble" },
  { y:"80%", x:70,  rot:-4, scale:1,    op:0.5,  type:"code",     text:"int main(){\n  return 0;\n}" },
  { y:"88%", x:220, rot:6,  scale:1,    op:0.38, type:"stain" },
  { y:"95%", x:10,  rot:-3, scale:1,    op:0.55, type:"notice",   text:"BACKLOG: 2\nno more pls" },
];

const handStyle = { fontSize:15, fontFamily:"'Caveat',cursive", color:"#8A6030", fontWeight:700, whiteSpace:"pre", lineHeight:1.3 };
const codeStyle = { fontSize:10, fontFamily:"'Courier New',monospace", color:"#6B8A6B", fontWeight:700, whiteSpace:"pre", lineHeight:1.55, background:"rgba(106,138,106,0.08)", padding:"4px 6px", borderRadius:3 };
const noticeStyle = { fontSize:10, fontFamily:"'DM Sans',sans-serif", color:"#A85A4A", fontWeight:800, whiteSpace:"pre", lineHeight:1.55, background:"rgba(220,150,130,0.10)", border:"1.5px solid rgba(180,90,70,0.18)", padding:"4px 7px", borderRadius:3, boxShadow:"1px 2px 4px rgba(90,50,30,0.06)" };

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

// A coffee-ring stain — two slightly offset, imperfect ellipses rather than
// a clean circle, so it reads as a mug set down carelessly, not a logo.
function Stain(){
  return (
    <svg width="50" height="44" viewBox="0 0 52 46" fill="none" opacity="0.4">
      <ellipse cx="26" cy="24" rx="23" ry="18" stroke="#8A6030" strokeWidth="1.6" transform="rotate(-6 26 24)"/>
      <ellipse cx="29" cy="21" rx="16" ry="12.5" stroke="#8A6030" strokeWidth="1.1" opacity="0.55" transform="rotate(4 29 21)"/>
    </svg>
  );
}

// A loose pen underline/emphasis mark, like someone circled or underlined
// something in the margin while reviewing.
function Scribble(){
  return (
    <svg width="46" height="20" viewBox="0 0 48 22" fill="none" stroke="#C0392B" strokeWidth="2.2" strokeLinecap="round" opacity="0.5">
      <path d="M2 16 Q10 4 18 13 T34 11 T46 16"/>
    </svg>
  );
}

// A hand-scratched asterisk, the kind of mark that means "important" or
// "see footnote" in actual margin notes.
function Star(){
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#A0825A" strokeWidth="1.7" strokeLinecap="round" opacity="0.55">
      <path d="M10 1 L10 19 M1.5 10 L18.5 10 M3.8 3.8 L16.2 16.2 M16.2 3.8 L3.8 16.2"/>
    </svg>
  );
}

function DoodleContent({ item }){
  switch(item.type){
    case "math": return <div style={handStyle}>{item.text}</div>;
    case "code": return <div style={codeStyle}>{item.text}</div>;
    case "notice": return <div style={noticeStyle}>{item.text}</div>;
    case "circuit": return <Circuit/>;
    case "sine": return <Sine/>;
    case "gate": return <Gate/>;
    case "stain": return <Stain/>;
    case "scribble": return <Scribble/>;
    case "star": return <Star/>;
    default: return null;
  }
}

// "2% from the viewport edge" alone is fine on a normal screen but leaves a
// huge dead gap on a wide monitor, since the board stays a fixed ~300px
// wide in the center regardless of viewport width. 50% - 380px - x is each
// item's actual position: 380px is roughly "hugging the board," and x (0 to
// ~260) pushes it further out toward the edge from there, so different
// items land at genuinely different depths instead of one shared strip.
// max(2%, ...) is the floor for narrow screens, where this would otherwise
// go negative — items with a larger x collapse toward that floor first as
// the screen narrows, which is the right order (the ones already furthest
// out run out of room before the ones hugging the board do). Opacity is
// per-item (mostly faint, a few bolder) so this reads as background
// texture, not a second layer of content competing with the board.
function DoodleItem({ item, side }){
  return (
    <div style={{
      position:"absolute",
      [side]: `max(2%, calc(50% - 380px - ${item.x}px))`,
      top: item.y,
      transform: `rotate(${item.rot}deg) scale(${item.scale})`,
      opacity: item.op ?? 0.5,
    }}>
      <DoodleContent item={item}/>
    </div>
  );
}

export default function MarginDoodles(){
  return (
    // z-index:1, not 0 — the app shell right after this in the DOM is
    // position:relative with no z-index of its own, which defaults to the
    // same paint layer as z-index:0. Tied layers paint in DOM order, so at
    // 0 this sat *behind* the shell's opaque background and never showed.
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:1, overflow:"hidden" }}>
      {LEFT_ITEMS.map((item, i) => <DoodleItem key={`l${i}`} item={item} side="left"/>)}
      {RIGHT_ITEMS.map((item, i) => <DoodleItem key={`r${i}`} item={item} side="right"/>)}
    </div>
  );
}
