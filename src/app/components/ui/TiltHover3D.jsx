"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Cursor-driven 3D tilt — perspective wrapper + spring-smoothed rotateX/Y.
 * Put layout/visual classes on `innerClassName` (e.g. rounded corners, group/image).
 */
export default function TiltHover3D({
  children,
  className = "",
  innerClassName = "",
  maxTilt = 11,
  perspective = 960,
}) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 320, damping: 32, mass: 0.45 });
  const sy = useSpring(my, { stiffness: 320, damping: 32, mass: 0.45 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div className={className} style={{ perspective: `${perspective}px` }}>
      <motion.div
        ref={ref}
        className={`will-change-transform ${innerClassName}`.trim()}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {children}
      </motion.div>
    </div>
  );
}
