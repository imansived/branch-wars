export default function UnlockToast({ branch }){
  if(!branch) return null;
  const Icon = branch.icon;

  return (
    <div style={{
      position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)",
      zIndex:30, pointerEvents:"none", animation:"unlockToast 1.6s ease-out forwards",
      whiteSpace:"nowrap",
    }}>
      <div style={{
        display:"flex", alignItems:"center", gap:6,
        background:`linear-gradient(155deg, ${branch.flat}, ${branch.border})`,
        color:branch.fg, border:`1.5px solid ${branch.border}`,
        borderRadius:20, padding:"6px 14px",
        fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:12, letterSpacing:1,
        boxShadow:`0 4px 16px ${branch.glow}, 0 2px 6px rgba(0,0,0,0.15)`,
      }}>
        <Icon size={14} strokeWidth={2.5}/>
        {branch.isCS ? "♛ CS UNLOCKED" : `${branch.short} UNLOCKED`}
      </div>
    </div>
  );
}
