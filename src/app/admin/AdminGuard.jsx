"use client";

import { useRole } from "@/hooks/useRole";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import Link from "next/link";
import { ShieldOff } from "lucide-react";

function AdminGuardInner({ children }) {
  const role = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);
  const searchString = searchParams.toString();

  useEffect(() => {
    if (role === "guest") {
      const fullPath = searchString ? `${pathname}?${searchString}` : pathname;
      const callbackUrl = encodeURIComponent(fullPath);
      router.replace(`/auth?callbackUrl=${callbackUrl}`);
    } else if (role !== "admin" && role !== "host") {
      router.replace("/profile");
    }
    setIsChecking(false);
  }, [role, router, pathname, searchString]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (role !== "admin" && role !== "host") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: "rgba(255,145,77,0.1)",
              border: "1px solid rgba(255,145,77,0.2)",
            }}
          >
            <ShieldOff className="w-8 h-8 text-[#ff914d]" strokeWidth={1.5} />
          </div>
          <h2 className="font-cormorant italic text-[#2c1810] text-3xl mb-3">
            Access Restricted
          </h2>
          <p className="text-[#9a7a62] text-sm mb-8 leading-relaxed">
            You need admin or host privileges to access this page.
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center px-7 py-3 bg-[#ff914d] text-black text-sm font-semibold rounded-full hover:bg-[#ff7a2e] transition-all"
          >
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

export default function AdminGuard({ children }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <AdminGuardInner>{children}</AdminGuardInner>
    </Suspense>
  );
}
