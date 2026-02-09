"use client";

export default function Score10({ label, value, onChange, endLeft, endRight }) {
  const focusValue = value ?? 0;

  const onRadioKeyDown = (e, i) => {
    if (
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "ArrowUp" &&
      e.key !== "ArrowDown" &&
      e.key !== "Home" &&
      e.key !== "End"
    ) {
      return;
    }
    e.preventDefault();

    let next = i;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 10;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(0, i - 1);
    else if (e.key === "ArrowRight" || e.key === "ArrowDown")
      next = Math.min(10, i + 1);

    onChange(next);
  };

  return (
    <div className="w-full">
      <div className="mt-4 w-full max-w-[520px] mx-auto overflow-hidden rounded-2xl border border-gray-200/70 bg-white/55 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        <div
          className="grid grid-cols-[repeat(11,minmax(0,1fr))]"
          role="radiogroup"
          aria-label={label}
        >
          {Array.from({ length: 11 }).map((_, i) => {
            const selected = value === i;
            const tabbable =
              (value !== null && value !== undefined ? selected : i === 0) || i === focusValue;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                className={[
                  "h-11 w-full bg-white/0 text-center",
                  "text-[12px] sm:text-[13px] font-medium tabular-nums tracking-tight",
                  "transition-colors duration-200 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40 focus-visible:ring-inset",
                  i === 0 ? "" : "border-l border-gray-200/70",
                  selected
                    ? "bg-gradient-to-b from-amber-100/95 via-amber-50/80 to-white/30 text-amber-900 ring-1 ring-amber-300/70 ring-inset font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                    : "text-gray-700 hover:bg-white/55 hover:text-gray-900",
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
        <div className="mt-2 w-full max-w-[520px] mx-auto flex justify-between text-xs text-gray-600">
          <span className="tabular-nums">
            0 <span className="text-gray-500">({endLeft})</span>
          </span>
          <span className="tabular-nums">
            10 <span className="text-gray-500">({endRight})</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
