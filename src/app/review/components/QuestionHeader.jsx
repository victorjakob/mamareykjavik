"use client";

export default function QuestionHeader({ label, helper, required, optional }) {
  return (
    <div className="text-center">
      <p className="text-[16px] md:text-[18px] font-medium text-gray-900">
        {label}
        {required ? (
          <>
            <span
              className="ml-0.5 align-super text-[12px] font-semibold text-gray-400"
              aria-hidden="true"
            >
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
        {optional ? (
          <span className="ml-2 text-[12px] font-medium text-gray-500">
            ({optional})
          </span>
        ) : null}
      </p>
      {helper ? (
        <p className="mt-1 text-[14px] md:text-[15px] text-gray-600 font-normal">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
