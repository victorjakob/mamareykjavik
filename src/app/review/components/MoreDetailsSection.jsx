"use client";

export default function MoreDetailsSection({ title, helper, children }) {
  return (
    <div className="rounded-3xl p-[1px] bg-gradient-to-br from-amber-200/20 via-white/10 to-emerald-200/15">
      <div className="rounded-3xl border border-gray-200/60 bg-white/55 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        <div className="px-5 py-4 rounded-t-3xl bg-gradient-to-r from-amber-100/70 via-white/45 to-emerald-100/55">
          <p className="text-[clamp(14px,4.5vw,20px)] font-aegean font-semibold text-gray-700 tracking-tight text-center whitespace-nowrap">
            {title}
          </p>
          {helper ? (
            <p className="mt-1 text-sm md:text-[15px] text-gray-600 font-normal text-center">
              {helper}
            </p>
          ) : null}
        </div>
        <div className="px-5 pb-6 pt-1 border-t border-gray-100/70">
          {children}
        </div>
      </div>
    </div>
  );
}
