"use client";

import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 767) {
  // Start with false to match server-side rendering
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted and check viewport size immediately
    setMounted(true);
    const update = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };
    
    // Check immediately - this will update isMobile right away
    update();
    
    // Listen to resize events
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);

  // Return the actual isMobile value after mount, false during SSR
  return isMobile;
}

