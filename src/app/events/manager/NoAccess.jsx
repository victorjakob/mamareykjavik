"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function NoAccess({ email }) {
  const { data: session, status } = useSession();
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRequestAccess = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to request access");
      }
      setRequested(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-6 mb-12">
      <div className="rounded-3xl border border-[#e8ddd3] bg-[#fffaf4]/95 shadow-[0_18px_60px_rgba(70,45,25,0.08)] p-7 sm:p-9 text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#ff914d] mb-3">
          Event manager
        </p>
        <h2 className="font-cormorant text-3xl sm:text-4xl italic text-[#2b211a] mb-4">
          We could not find your events yet.
        </h2>
        <p className="text-[#7b6657] leading-relaxed mb-2">
          You are signed in
          {(email || session?.user?.email) ? ` as ${email || session.user.email}` : ""}, but
          this email is not listed as a host or co-host on any event.
        </p>
        <p className="text-sm text-[#9a7a62] mb-7">
          Ask an admin to add this email to the event, or send a quick request
          and we will connect it for you.
        </p>

        {requested ? (
          <div className="rounded-2xl bg-[#f1eadf] px-5 py-4 text-[#4b3a2e] font-medium">
            Your request has been sent.
          </div>
        ) : (
          <>
            <button
              onClick={handleRequestAccess}
              disabled={loading}
              className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-[#ff914d] text-white text-xs font-semibold uppercase tracking-[0.22em] hover:bg-[#e87933] disabled:opacity-60 transition"
            >
              {loading ? "Sending..." : "Ask us to connect it"}
            </button>
            {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
}
