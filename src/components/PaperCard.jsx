export default function PaperCard({ children, borderColor="#8B6914", accentColor="#9A7B00" }){
  return (
    <div style={{
      background:"#FFFEF8",
      backgroundImage:"repeating-linear-gradient(180deg,transparent,transparent 22px,rgba(100,140,200,0.13) 23px)",
      border:`1.5px solid ${borderColor}`, borderLeft:`5px solid ${accentColor}`,
      borderRadius:8, padding:"20px 22px 18px", marginBottom:20,
      boxShadow:"0 4px 20px rgba(0,0,0,0.08)", fontFamily:"'DM Sans',sans-serif",
    }}>
      <div style={{ paddingLeft:10 }}>{children}</div>
    </div>
  );
}
