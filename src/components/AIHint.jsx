import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const ICONS = { up: ChevronUp, down: ChevronDown, left: ChevronLeft, right: ChevronRight };

export default function AIHint({ dir }){
  if(!dir) return null;
  const Icon = ICONS[dir];

  return (
    <div
      title="AI-suggested move"
      style={{
        position:"absolute", top:-14, right:-14, zIndex:5,
        width:34, height:34, borderRadius:"50%",
        background:"#1a0a00", color:"#FAF6EC",
        display:"flex", alignItems:"center", justifyContent:"center",
        border:"2px solid #FAF6EC",
        boxShadow:"0 4px 14px rgba(0,0,0,0.35)",
        animation:"hintPulse 1.1s ease-in-out infinite",
      }}
    >
      <Icon size={18} strokeWidth={3}/>
    </div>
  );
}
