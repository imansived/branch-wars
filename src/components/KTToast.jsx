import { useEffect } from "react";

export default function KTToast({ onDone }){
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
      zIndex:140, animation:"ktToastPop 3.2s cubic-bezier(.21,1.2,.65,1) forwards",
      pointerEvents:"none", width:"min(310px,86vw)",
    }}>
      <div style={{
        background:"linear-gradient(155deg,#FFF8E0,#FBEFC8)", border:"2px solid #1A6B3A",
        borderRadius:12, padding:"12px 16px", textAlign:"center",
        boxShadow:"0 10px 30px rgba(26,107,58,0.3), 0 4px 10px rgba(0,0,0,0.15)",
        fontFamily:"'DM Sans',sans-serif",
      }}>
        <div style={{ fontSize:12, fontWeight:900, color:"#1A6B3A", marginBottom:3 }}>Backlog cleared! 📋</div>
        <div style={{ fontSize:10.5, color:"#5a3a00", fontWeight:600, lineHeight:1.5 }}>
          Grace marks applied by the university.<br/>Use your second chance wisely.
        </div>
      </div>
    </div>
  );
}
