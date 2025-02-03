"use client";

import { Suspense } from "react";
import AuthContent from "../components/auth/AuthContent";

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
