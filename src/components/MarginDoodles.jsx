// A flat wall of equally-visible sticky notes reads as designed, not found.
// The thing that sells "scattered in a margin" is a hierarchy: most items
// are faint and small (you'd only notice them if you were actually looking
// around the page, the way "PPT_Final_FINAL_2.pptx" is meant to be a small
// discovery, not a headline), a few are bold enough to catch the eye, and
// only the boldest ever get the sticky-note box or a red highlighted word.
// That hierarchy — "ghost" / "normal" / "accent" — drives everything below:
// opacity, scale, how close an item sits to the board, and whether it gets
// boxed. It's generated from a seeded RNG rather than hand-placed so the
// phrase list can grow without hand-computing 60 positions, but the seed is
// fixed, so layout is stable across renders — this isn't reshuffling on
// every re-render, only on a source change.

function mulberry32(seed){
  return function(){
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20240613);
const between = (a, b) => a + rand() * (b - a);
const pick = arr => arr[Math.floor(rand() * arr.length)];

// Engineering-college specific on purpose — the texture only works as an
// inside joke if it's recognizable without the UI explaining itself.
// "*word*" marks the part that renders as a red highlight — used sparingly,
// so it stays an occasional jolt rather than wallpaper.
const LEFT_TEXT = [
  { kind:"label", text:"ATTENDANCE\n62% ⚠ DETAIN" },
  { kind:"label", text:"ATTENDANCE: *27.3%*" },
  { kind:"quote", text:"“SIR ONE MARK PLEASE”" },
  { kind:"label", text:"LAB RECORD PENDING" },
  { kind:"code",  text:"segmentation fault" },
  { kind:"label", text:"DEFAULTER LIST\nRoll No. 23 😭" },
  { kind:"quote", text:"“BRO DID YOU STUDY?”" },
  { kind:"label", text:"7:59 AM → CLASS AT 8:00" },
  { kind:"label", text:"75% ATTENDANCE\n*REQUIRED*" },
  { kind:"code",  text:"git blame life.c" },
  { kind:"label", text:"GROUP PROJECT™" },
  { kind:"label", text:"Hall ticket:\nnot generated yet" },
  { kind:"code",  text:"BACKLOG LOADING..." },
  { kind:"label", text:"CGPA target: 8.5\nActual: 6.2", force:"normal" },
  { kind:"code",  text:"PPT_Final_FINAL_2.pptx", force:"ghost" },
  { kind:"quote", text:"“JUST COPY MY RECORD”" },
  { kind:"label", text:"HACKATHON MODE" },
  { kind:"code",  text:"404: Motivation *Not Found*", force:"ghost" },
  { kind:"label", text:"2 AM ASSIGNMENT" },
  { kind:"label", text:"Lab submit:\n✗ not done" },
  { kind:"code",  text:"sudo apt install\nmotivation" },
  { kind:"label", text:"ATTENDANCE SHORTAGE" },
  { kind:"quote", text:"“SIR, I WAS PRESENT”" },
];

const RIGHT_TEXT = [
  { kind:"label", text:"Viva tmrw\n2PM • Lab-4" },
  { kind:"label", text:"VIVA IN *5 MIN*" },
  { kind:"quote", text:"“SIR, NETWORK ISSUE”" },
  { kind:"label", text:"DETAINED:\n1 subject short" },
  { kind:"label", text:"FEE DUE\n₹48,000" },
  { kind:"math",  text:"dy/dx = ?" },
  { kind:"label", text:"INTERNALS *TOMORROW*" },
  { kind:"quote", text:"“SEND NOTES”" },
  { kind:"label", text:"PROJECT SUBMISSION" },
  { kind:"code",  text:"npm install" },
  { kind:"label", text:"DEADLINE: *TODAY*" },
  { kind:"label", text:"EXAM TMRW\n9AM HALL-3" },
  { kind:"label", text:"File submission:\nTomorrow 9AM sharp" },
  { kind:"code",  text:"int main(){\n  return 0;\n}" },
  { kind:"label", text:"CGPA CALCULATOR" },
  { kind:"label", text:"PLACEMENT SEASON" },
  { kind:"label", text:"VIVA SURVIVAL" },
  { kind:"quote", text:"“IMPORTANT QUESTIONS\nONLY”", force:"ghost" },
  { kind:"label", text:"LAB MANUAL" },
  { kind:"label", text:"BACKLOG: 2\nno more pls" },
  { kind:"label", text:"RESULT DECLARED" },
  { kind:"label", text:"SUBMIT BEFORE\n*11:59 PM*" },
  { kind:"label", text:"KT cleared\nfinally 🙏" },
];

const DECO_TYPES = ["stain","scribble","star","circuit","sine","gate","arrow","checkbox","rule","dots"];

const labelStyle  = { fontSize:10, fontFamily:"'DM Sans',sans-serif", color:"#8A6030", fontWeight:800, whiteSpace:"pre", lineHeight:1.5, letterSpacing:0.2 };
const boxStyle    = { background:"rgba(220,150,130,0.12)", border:"1.5px solid rgba(180,90,70,0.22)", padding:"4px 7px", borderRadius:3, boxShadow:"1px 2px 4px rgba(90,50,30,0.07)" };
const quoteStyle  = { fontSize:15, fontFamily:"'Caveat',cursive", color:"#4A6FA5", fontWeight:700, whiteSpace:"pre", lineHeight:1.25 };
const codeStyle   = { fontSize:10, fontFamily:"'Courier New',monospace", color:"#6B8A6B", fontWeight:700, whiteSpace:"pre", lineHeight:1.5 };
const codeBoxStyle = { background:"rgba(106,138,106,0.10)", padding:"4px 6px", borderRadius:3 };
const mathStyle   = { fontSize:15, fontFamily:"'Caveat',cursive", color:"#8A6030", fontWeight:700, whiteSpace:"pre", lineHeight:1.3 };

// "*word*" -> a red highlighted span. Plain string segments pass through
// untouched. Deliberately rare in the source text, not a styling default.
function renderHighlighted(text){
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*")
      ? <span key={i} style={{ color:"#C0392B", fontWeight:900 }}>{part.slice(1, -1)}</span>
      : part
  );
}

function Circuit(){
  return (
    <svg width="64" height="26" viewBox="0 0 72 30" fill="none" stroke="#A08050" strokeWidth="1.8">
      <line x1="0" y1="15" x2="10" y2="15"/><rect x="10" y="9" width="14" height="12" rx="1.5"/>
      <line x1="24" y1="15" x2="34" y2="15"/><circle cx="38" cy="15" r="5"/>
      <line x1="43" y1="15" x2="52" y2="15"/><rect x="52" y="9" width="14" height="12" rx="1.5"/>
      <line x1="66" y1="15" x2="72" y2="15"/>
    </svg>
  );
}

function Sine(){
  return (
    <svg width="70" height="22" viewBox="0 0 80 26" fill="none" stroke="#A0825A" strokeWidth="2">
      <path d="M0 13 C10 2 20 2 30 13 S50 24 60 13 S70 2 80 13"/>
    </svg>
  );
}

function Gate(){
  return (
    <svg width="54" height="32" viewBox="0 0 62 38" fill="none" stroke="#8A6FA0" strokeWidth="2">
      <line x1="0" y1="10" x2="14" y2="10"/><line x1="0" y1="28" x2="14" y2="28"/>
      <path d="M14 4 L14 34 Q46 34 46 19 Q46 4 14 4Z"/><line x1="46" y1="19" x2="62" y2="19"/>
    </svg>
  );
}

// A coffee-ring stain — two slightly offset, imperfect ellipses rather than
// a clean circle, so it reads as a mug set down carelessly, not a logo.
function Stain(){
  return (
    <svg width="50" height="44" viewBox="0 0 52 46" fill="none">
      <ellipse cx="26" cy="24" rx="23" ry="18" stroke="#8A6030" strokeWidth="1.6" transform="rotate(-6 26 24)"/>
      <ellipse cx="29" cy="21" rx="16" ry="12.5" stroke="#8A6030" strokeWidth="1.1" opacity="0.55" transform="rotate(4 29 21)"/>
    </svg>
  );
}

// A loose pen underline/emphasis mark, like someone circled or underlined
// something in the margin while reviewing.
function Scribble(){
  return (
    <svg width="46" height="20" viewBox="0 0 48 22" fill="none" stroke="#C0392B" strokeWidth="2.2" strokeLinecap="round">
      <path d="M2 16 Q10 4 18 13 T34 11 T46 16"/>
    </svg>
  );
}

// A hand-scratched asterisk, the kind of mark that means "important" or
// "see footnote" in actual margin notes.
function Star(){
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#A0825A" strokeWidth="1.7" strokeLinecap="round">
      <path d="M10 1 L10 19 M1.5 10 L18.5 10 M3.8 3.8 L16.2 16.2 M16.2 3.8 L3.8 16.2"/>
    </svg>
  );
}

// A small curved "see here" arrow — the kind you'd draw pointing at
// something you just wrote, not a UI chevron.
function Arrow(){
  return (
    <svg width="34" height="20" viewBox="0 0 38 22" fill="none" stroke="#8A6030" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 14 Q18 2 34 10"/>
      <path d="M26 5 L34 10 L28 16"/>
    </svg>
  );
}

function Checkbox(){
  const checked = rand() > 0.5;
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="#8A6030" strokeWidth="1.7">
      <rect x="1.2" y="1.2" width="14.6" height="14.6" rx="2"/>
      {checked && <path d="M4 8.5 L7 11.8 L13 4.8" strokeLinecap="round" strokeLinejoin="round"/>}
    </svg>
  );
}

// A thin hand-ruled line — the kind drawn under a word for emphasis, or
// just to separate two scrawled notes. Deliberately not a UI divider.
function Rule(){
  return <div style={{ width:between(34, 54), height:1.4, background:"#A0825A" }}/>;
}

// A small patch of dots — a scrap of the page's own graph-paper texture
// repeated at a different scale/rotation, like it bled through from the
// line beneath.
function DotGrid(){
  const dots = [];
  for(let r = 0; r < 3; r++) for(let c = 0; c < 4; c++) dots.push([c * 8 + 2, r * 8 + 2]);
  return (
    <svg width="30" height="22" viewBox="0 0 30 22">
      {dots.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="1.3" fill="#A0825A"/>)}
    </svg>
  );
}

function DoodleContent({ item }){
  switch(item.kind){
    case "label": {
      const style = item.tier === "accent" ? { ...labelStyle, ...boxStyle } : labelStyle;
      return <div style={style}>{renderHighlighted(item.text)}</div>;
    }
    case "quote": return <div style={quoteStyle}>{item.text}</div>;
    case "math": return <div style={mathStyle}>{item.text}</div>;
    case "code": {
      const style = item.tier === "accent" ? { ...codeStyle, ...codeBoxStyle } : codeStyle;
      return <div style={style}>{renderHighlighted(item.text)}</div>;
    }
    case "stain": return <Stain/>;
    case "scribble": return <Scribble/>;
    case "star": return <Star/>;
    case "circuit": return <Circuit/>;
    case "sine": return <Sine/>;
    case "gate": return <Gate/>;
    case "arrow": return <Arrow/>;
    case "checkbox": return <Checkbox/>;
    case "rule": return <Rule/>;
    case "dots": return <DotGrid/>;
    default: return null;
  }
}

// Interleaves one decorative mark after every two text entries, so the
// page is never more than a couple of notes deep without a breather —
// otherwise, at this many phrases, it reads as a wall of text rather than
// a margin.
function withDecoration(textEntries){
  const out = [];
  textEntries.forEach((entry, i) => {
    out.push(entry);
    if(i % 2 === 1) out.push({ kind: pick(DECO_TYPES) });
  });
  return out;
}

// Rough rendered height in px, scaled later — a fixed percentage-per-item
// band (100/n) ignored the fact that a two-line boxed note is 2-3x taller
// than a checkbox glyph, so dense runs of multi-line text could overlap
// their neighbor even though their y *anchors* were correctly spaced. This
// estimate feeds a cumulative layout instead, so spacing is proportional
// to what each item actually needs.
function estimateHeight(entry){
  if(entry.kind === "label" || entry.kind === "code"){
    const lines = (entry.text.match(/\n/g) || []).length + 1;
    return 15 + lines * 13;
  }
  if(entry.kind === "quote") return (entry.text.match(/\n/g) || []).length ? 34 : 20;
  if(entry.kind === "math") return 20;
  return 26; // decorative marks
}

// Rough rendered width in px (pre-scale) — used to figure out how close an
// item can safely get. Treating every item as the same width was the bug
// behind two real overlaps: a wide two-line boxed note and a lone checkbox
// glyph need very different clearance from the board, and a single global
// "how close is allowed" constant can't be right for both at once.
const CHAR_WIDTH = { label:6.6, code:6.2, quote:7.6, math:7.6 };
function estimateWidth(entry){
  if(!entry.text) return 40; // decorative marks are small and roughly fixed-size
  const longestLine = Math.max(...entry.text.replace(/\*/g, "").split("\n").map(l => l.length));
  return longestLine * CHAR_WIDTH[entry.kind] + (entry.kind === "label" || entry.kind === "code" ? 14 : 0);
}

// Each entry becomes a positioned item: a tier (ghost/normal/accent, see
// top-of-file note) picked at random unless an entry forces one, which
// drives opacity and scale. x is then split into two parts: `safe`, the
// minimum distance this item's own (scaled) width needs from the board to
// avoid overlapping it, and `extra`, how much further beyond that minimum
// it actually sits — which is what the tier controls. rand()**xPow skews
// toward 0 (right at the safe minimum) as xPow climbs, so accent items hug
// as close as their own size allows, ghost items drift further out on
// average, and normal sits in between. The board's own half-width tops out
// around 160px, so the +20 below is just a little extra breathing room.
function layout(entries){
  const heights = entries.map(estimateHeight);
  const gap = 15;
  let cursor = 0;
  const centers = heights.map(h => { const c = cursor + h / 2; cursor += h + gap; return c; });
  const total = cursor - gap;

  return entries.map((entry, i) => {
    const tier = entry.force ?? (rand() < 0.42 ? "ghost" : rand() < 0.84 ? "normal" : "accent");
    const [opLo, opHi] = tier === "ghost" ? [0.14, 0.26] : tier === "accent" ? [0.55, 0.72] : [0.34, 0.48];
    const [scLo, scHi] = tier === "ghost" ? [0.7, 0.85] : tier === "accent" ? [1, 1.16] : [0.88, 1.03];
    const scale = between(scLo, scHi);
    const safe = estimateWidth(entry) * scale + 180;
    const xPow = tier === "ghost" ? 0.85 : tier === "accent" ? 2.4 : 1.5;
    const extraRange = tier === "ghost" ? 260 : tier === "accent" ? 90 : 170;
    return {
      ...entry,
      tier,
      op: between(opLo, opHi),
      scale,
      x: safe + Math.pow(rand(), xPow) * extraRange,
      y: `${((centers[i] / total) * 96 + 2).toFixed(2)}%`,
      rot: between(-9, 9),
    };
  });
}

const LEFT_ITEMS = layout(withDecoration(LEFT_TEXT));
const RIGHT_ITEMS = layout(withDecoration(RIGHT_TEXT));

// "2% from the viewport edge" alone is fine on a normal screen but leaves a
// huge dead gap on a wide monitor, since the board stays a fixed ~300px
// wide in the center regardless of viewport width. 50% - x is each item's
// actual position; x already bakes in that item's own safe clearance from
// the board (see layout() above), so this is just placing it. max(2%, ...)
// is the floor for narrow screens, where this would otherwise go negative.
function DoodleItem({ item, side }){
  return (
    <div style={{
      position:"absolute",
      [side]: `max(2%, calc(50% - ${item.x}px))`,
      top: item.y,
      transform: `rotate(${item.rot}deg) scale(${item.scale})`,
      opacity: item.op,
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
