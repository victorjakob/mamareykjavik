import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SubmitButton({ isSubmitting, imageProcessing }) {
  const router = useRouter();
  const loading = isSubmitting || imageProcessing;

  return (
    <div className="flex justify-end gap-3 pt-6">
      <button
        type="button"
        onClick={() => router.push("/events/manager")}
        className="px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
        style={{ background: "#ffffff", border: "1.5px solid #e8ddd3", color: "#9a7a62" }}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "#ff914d", boxShadow: loading ? "none" : "0 2px 12px rgba(255,145,77,0.3)" }}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? "Saving…" : imageProcessing ? "Processing image…" : "Save Changes"}
      </button>
    </div>
  );
}
