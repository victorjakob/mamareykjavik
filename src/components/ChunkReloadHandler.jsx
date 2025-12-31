"use client";

import { useEffect, useRef } from "react";

const SESSION_FLAG = "mama_chunk_reload_attempted";

export default function ChunkReloadHandler() {
  const isReloadingRef = useRef(false);

  useEffect(() => {
    // Reset the session flag when the component mounts after a successful load
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SESSION_FLAG);
      }
    } catch (error) {
      // Ignore sessionStorage errors (e.g., private browsing)
      console.warn("ChunkReloadHandler: sessionStorage unavailable", error);
    }

    const handleChunkError = (event, fromPromise = false) => {
      if (isReloadingRef.current) return;

      const error = fromPromise ? event.reason : event.error;
      const message =
        (fromPromise ? event.reason?.message : event?.message) ||
        error?.message ||
        "";
      const stack = error?.stack || "";
      const errorString = error?.toString() || "";
      const targetSrc = !fromPromise && event?.target?.src;

      // Check all possible error representations
      const isChunkFailure =
        message.includes("ChunkLoadError") ||
        message.includes("Failed to fetch dynamically imported module") ||
        message.includes("Failed to load chunk") ||
        message.includes("Loading chunk") ||
        message.includes("Loading CSS chunk") ||
        message.includes("/_next/static/chunks/") ||
        stack.includes("/_next/static/chunks/") ||
        errorString.includes("/_next/static/chunks/") ||
        (typeof targetSrc === "string" &&
          targetSrc.includes("/_next/static/chunks/")) ||
        error?.name === "ChunkLoadError" ||
        error?.code === "CHUNK_LOAD_ERROR";

      if (!isChunkFailure) {
        return;
      }

      try {
        if (
          typeof window !== "undefined" &&
          sessionStorage.getItem(SESSION_FLAG)
        ) {
          // We've already reloaded once this session; don't loop forever
          return;
        }
      } catch {
        // Ignore sessionStorage access issues
      }

      isReloadingRef.current = true;

      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(SESSION_FLAG, "1");
        }
      } catch {
        // Ignore
      }

      // Give the browser a brief moment before reloading
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }, 100);
    };

    const windowErrorListener = (event) => handleChunkError(event, false);
    const promiseRejectionListener = (event) => handleChunkError(event, true);

    window.addEventListener("error", windowErrorListener, true);
    window.addEventListener("unhandledrejection", promiseRejectionListener);

    return () => {
      window.removeEventListener("error", windowErrorListener, true);
      window.removeEventListener(
        "unhandledrejection",
        promiseRejectionListener
      );
    };
  }, []);

  return null;
}
