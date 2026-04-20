"use client";

export default function Card({ children }) {
  return (
    <div className="w-full max-w-[520px]">
      <div
        className="rounded-3xl p-[1px]"
        style={{ background: "linear-gradient(135deg, rgba(255,145,77,0.15) 0%, rgba(255,255,255,0.04) 50%, rgba(201,184,158,0.08) 100%)" }}
      >
        <div
          className="rounded-3xl p-5 md:p-7"
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
