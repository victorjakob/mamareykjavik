"use client";

export default function Score10({ label, value, onChange, endLeft, endRight }) {
  const focusValue = value ?? 0;

  const onRadioKeyDown = (e, i) => {
    if (!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(e.key)) return;
    e.preventDefault();
    let next = i;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 10;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(0, i - 1);
    else if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(10, i + 1);
    onChange(next);
  };

  return (
    <div className="w-full">
      <div
        className="mt-4 w-full max-w-[520px] mx-auto overflow-hidden rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="grid grid-cols-[repeat(11,minmax(0,1fr))]" role="radiogroup" aria-label={label}>
          {Array.from({ length: 11 }).map((_, i) => {
            const selected = value === i;
            const tabbable = (value !== null && value !== undefined ? selected : i === 0) || i === focusValue;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                className={[
                  "h-11 w-full text-center",
                  "text-[12px] sm:text-[13px] font-medium tabular-nums tracking-tight",
                  "transition-colors duration-200 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff914d]/30 focus-visible:ring-inset",
                  i === 0 ? "" : "border-l border-white/[0.06]",
                  selected
                    ? "bg-[#ff914d]/15 text-[#ff914d] ring-1 ring-[#ff914d]/30 ring-inset font-semibold"
                    : "text-[#a09488] hover:bg-white/[0.04] hover:text-[#f0ebe3]",
                ].join(" ")}
                aria-label={`${i}`}
                aria-checked={selected}
                tabIndex={tabbable ? 0 : -1}
                onClick={() => onChange(i)}
                onKeyDown={(e) => onRadioKeyDown(e, i)}
              >
                {i}
              </button>
            );
          })}
        </div>
      </div>
      {endLeft && endRight ? (
        <div className="mt-2 w-full max-w-[520px] mx-auto flex justify-between text-xs text-[#6a5e52]">
          <span className="tabular-nums">0 <span className="text-[#524840]">({endLeft})</span></span>
          <span className="tabular-nums">10 <span className="text-[#524840]">({endRight})</span></span>
        </div>
      ) : null}
    </div>
  );
}
