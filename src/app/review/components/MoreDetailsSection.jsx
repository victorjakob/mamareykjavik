"use client";

export default function MoreDetailsSection({ title, helper, children }) {
  return (
    <div
      className="rounded-3xl p-[1px]"
      style={{ background: "linear-gradient(135deg, rgba(255,145,77,0.10) 0%, rgba(255,255,255,0.03) 60%, rgba(201,184,158,0.06) 100%)" }}
    >
      <div
        className="rounded-3xl"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="px-5 py-4 rounded-t-3xl"
          style={{ background: "rgba(255,145,77,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-[clamp(14px,4.5vw,18px)] font-medium text-[#f0ebe3] tracking-tight text-center">
            {title}
          </p>
          {helper ? (
            <p className="mt-1 text-sm text-[#8a7e72] font-normal text-center">{helper}</p>
          ) : null}
        </div>
        <div className="px-5 pb-6 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}
