"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function GoogleSignin({
  callbackUrl: propCallbackUrl = "/events",
}) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || propCallbackUrl;

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 mb-4 hover:bg-gray-50 transition"
    >
      <svg className="w-5 h-5" viewBox="0 0 48 48">
        <g>
          <path
            d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.1-2.7-.5-4z"
            fill="#FFC107"
          />
          <path
            d="M6.3 14.7l7 5.1C15.1 16.2 19.2 13 24 13c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.3 5.1 29.4 3 24 3 15.6 3 8.1 8.5 6.3 14.7z"
            fill="#FF3D00"
          />
          <path
            d="M24 45c5.7 0 10.6-1.9 14.3-5.1l-6.6-5.4C29.7 36.1 27 37 24 37c-5.7 0-10.6-3.8-12.3-9.1l-7 5.4C8.1 39.5 15.6 45 24 45z"
            fill="#4CAF50"
          />
          <path
            d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.7 8.5-11.7 8.5-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 .9 8.2 2.6l6.2-6.2C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.1-2.7-.5-4z"
            fill="none"
          />
        </g>
      </svg>
      <span>Sign in with Google</span>
    </button>
  );
}
