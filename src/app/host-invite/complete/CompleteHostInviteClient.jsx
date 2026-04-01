"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CompleteHostInviteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { status, update } = useSession();
  const [error, setError] = useState("");
  const [working, setWorking] = useState(true);

  useEffect(() => {
    async function run() {
      if (!token) {
        setError("Missing host invite token.");
        setWorking(false);
        return;
      }

      if (status === "loading") return;

      if (status === "unauthenticated") {
        const callbackUrl = encodeURIComponent(
          `/host-invite/complete?token=${encodeURIComponent(token)}`
        );
        router.replace(`/auth?mode=login&callbackUrl=${callbackUrl}`);
        return;
      }

      try {
        const res = await fetch("/api/host-invites/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || "Failed to activate host access.");
        }

        await update();
        router.replace(json?.redirectTo || "/admin/create-event");
      } catch (err) {
        console.error("Error completing host invite:", err);
        setError(err.message || "Failed to activate host access.");
        setWorking(false);
      }
    }

    run();
  }, [token, status, router, update]);

  return (
    <main className="min-h-screen px-4 py-16">
      <div className="mx-auto mt-24 max-w-xl rounded-[2rem] border border-gray-100 bg-white p-8 text-center shadow-sm">
        {error ? (
          <>
            <h1 className="text-3xl font-semibold text-gray-900">
              Couldn&apos;t activate host access
            </h1>
            <p className="mt-4 text-gray-600">{error}</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold text-gray-900">
              Setting up your host access
            </h1>
            <p className="mt-4 text-gray-600">
              We&apos;re confirming your invite and taking you to create your event.
            </p>
            {working ? (
              <div className="mt-6 inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
                Please wait...
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
