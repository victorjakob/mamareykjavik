"use client";

export default function QuestionHeader({ label, helper, required, optional }) {
  return (
    <div className="text-center">
      <p className="text-[15px] md:text-[16px] font-medium text-[#f0ebe3] leading-snug">
        {label}
        {required ? (
          <>
            <span className="ml-0.5 align-super text-[11px] font-semibold text-[#ff914d]/70" aria-hidden="true">*</span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
        {optional ? (
          <span className="ml-2 text-[12px] font-medium text-[#6a5e52]">({optional})</span>
        ) : null}
      </p>
      {helper ? (
        <p className="mt-1 text-[13px] text-[#6a5e52] font-normal">{helper}</p>
      ) : null}
    </div>
  );
}
