"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

export default function ClientPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth");
      return;
    }

    // If we have a session, redirect to the same page with email as query param
    router.push(`/profile/my-trips?email=${session.user.email}`);
  }, [session, status, router]);

  return <LoadingSpinner />;
}
