import { Loader2 } from "lucide-react";

export default function SubmitButton({ isSubmitting, imageProcessing, isDisabled = false }) {
  const disabled = isSubmitting || imageProcessing || isDisabled;
  const showAgreementLabel = isDisabled && !isSubmitting && !imageProcessing;

  return (
    <div className="pt-4">
      <button
        type="submit"
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: disabled ? "#f3ede7" : "#ff914d",
          color: disabled ? "#c0a890" : "#fff",
          boxShadow: disabled ? "none" : "0 2px 12px rgba(255,145,77,0.3)",
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating Event…
          </>
        ) : showAgreementLabel ? (
          "Agree to policy to continue"
        ) : (
          "Create Event"
        )}
      </button>
    </div>
  );
}
