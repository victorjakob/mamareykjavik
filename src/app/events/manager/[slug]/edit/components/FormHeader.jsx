export default function FormHeader() {
  return (
    <div className="text-center mb-10 mt-4">
      <p className="text-[10px] uppercase tracking-[0.5em] mb-2" style={{ color: "#ff914d" }}>Event manager</p>
      <h1
        className="font-cormorant italic font-light leading-none"
        style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", color: "#2c1810" }}
      >
        Edit Event
      </h1>
      <div className="flex items-center justify-center gap-3 mt-3">
        <div className="w-10 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,145,77,0.35))" }} />
        <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "#c0a890" }}>Update details</p>
        <div className="w-10 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(255,145,77,0.35))" }} />
      </div>
    </div>
  );
}
