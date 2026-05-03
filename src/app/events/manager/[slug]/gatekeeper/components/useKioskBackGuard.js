// Trap the browser back button + tab-close while the kiosk is live.
//
// Why: tablets at the door get accidental swipes/back-presses constantly.
// Letting one of them pop the user out of the kiosk mid-event would
// expose the underlying admin pages and break the door flow entirely.
//
// How:
//   1. Push a sentinel history entry on mount.
//   2. On every `popstate`, immediately push the sentinel again — the
//      browser back button effectively does nothing while this is active.
//      The host can still exit the proper way (lock icon → PIN → close).
//   3. Add a `beforeunload` warning so accidentally hitting Cmd+W /
//      Ctrl+W / refresh prompts the staff before unloading.
//
// Pass `enabled = false` to disable the guard (e.g. while showing the
// reconciliation screen or the pre-activation set-up screen).

"use client";

import { useEffect } from "react";

export default function useKioskBackGuard(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    // Drop a sentinel onto the history stack so the very next back-press
    // pops THIS state (which we re-push), not the previous page.
    try {
      window.history.pushState({ __kioskGuard: true }, "");
    } catch {
      // Some embedded browsers (rare) reject pushState — silently no-op.
    }

    const onPopState = () => {
      try {
        window.history.pushState({ __kioskGuard: true }, "");
      } catch {
        /* ignore */
      }
    };

    const onBeforeUnload = (e) => {
      // The browser will show its own generic confirmation dialog. The
      // returnValue assignment is required by older browsers.
      e.preventDefault();
      e.returnValue = "Check-in is still active. Leave anyway?";
      return e.returnValue;
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [enabled]);
}
