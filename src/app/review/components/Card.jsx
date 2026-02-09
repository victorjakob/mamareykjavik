"use client";

export default function Card({ children }) {
  return (
    <div className="w-full max-w-[520px]">
      <div className="rounded-3xl p-[1px] bg-gradient-to-br from-amber-200/30 via-white/10 to-emerald-200/20 shadow-[0_16px_60px_-44px_rgba(0,0,0,0.55)]">
        <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 p-5 md:p-7">
          {children}
        </div>
      </div>
    </div>
  );
}
