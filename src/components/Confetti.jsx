const COLORS = ["#9A7B00","#1C1C1E","#5B2D8E","#0055CC","#1A6B3A","#6B7280","#7B1515","#0E7490"];

export default function Confetti(){
  const pieces = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.8,
    dur: 2.2 + Math.random() * 2,
    color: COLORS[i % COLORS.length],
    size: 5 + Math.random() * 9,
    rot: Math.random() * 360,
  }));

  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:200, overflow:"hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:"-20px",
          width:p.size, height:p.size, background:p.color,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          transform:`rotate(${p.rot}deg)`,
          animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
        }}/>
      ))}
    </div>
  );
}
