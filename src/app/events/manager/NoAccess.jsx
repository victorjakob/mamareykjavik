"use client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function NoAccess() {
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
    <div className="max-w-xl mx-auto mt-32 bg-white rounded-xl shadow-lg p-8 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
      <p className="mb-6 text-gray-700">
        You do not have permission to access this page.
      </p>
      {session?.user ? (
        requested ? (
          <div className="text-green-600 font-semibold">
            Your request for access has been sent!
          </div>
        ) : (
          <>
            <button
              onClick={handleRequestAccess}
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
            >
              {loading ? "Requesting..." : "Request Access"}
            </button>
            {error && <div className="mt-4 text-red-600">{error}</div>}
          </>
        )
      ) : (
        <button
          onClick={() => signIn()}
          className="px-6 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
        >
          Sign in to request access
        </button>
      )}
    </div>
  );
}
