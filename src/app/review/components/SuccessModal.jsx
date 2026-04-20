"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function SuccessModal({ open, title, sub, onClose }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="absolute inset-0 backdrop-blur-[4px]"
            style={{ background: "rgba(14,11,8,0.75)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-[360px]"
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="rounded-[28px] p-[1px]"
              style={{ background: "linear-gradient(135deg, rgba(255,145,77,0.3) 0%, rgba(255,255,255,0.08) 50%, rgba(16,185,129,0.2) 100%)" }}
            >
              <div
                className="relative overflow-hidden rounded-[28px] px-6 py-7"
                style={{
                  background: "rgba(20,16,12,0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="pointer-events-none absolute inset-0"
                  style={{ background: "radial-gradient(ellipse 120% 80% at 50% 0%, rgba(16,185,129,0.10) 0%, transparent 60%)" }}
                />

                <div className="relative mx-auto h-[72px] w-[72px]">
                  <motion.span
                    className="absolute -left-5 -top-2 h-2 w-2 rounded-full"
                    style={{ background: "rgba(16,185,129,0.6)" }}
                    animate={{ y: [0, -10, 0], opacity: [0.3, 0.9, 0.3] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.span
                    className="absolute -right-3 top-1 h-1.5 w-1.5 rounded-full"
                    style={{ background: "rgba(255,145,77,0.6)" }}
                    animate={{ y: [0, -8, 0], opacity: [0.3, 0.85, 0.3] }}
                    transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  />
                  <motion.span
                    className="absolute left-2 -bottom-3 h-1.5 w-1.5 rounded-full"
                    style={{ background: "rgba(16,185,129,0.5)" }}
                    animate={{ y: [0, 8, 0], opacity: [0.2, 0.75, 0.2] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
                  />

                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(255,145,77,0.08) 100%)", border: "1px solid rgba(16,185,129,0.25)" }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{ boxShadow: "0 18px 52px -34px rgba(16,185,129,0.8)" }}
                    animate={{ opacity: [0.55, 0.9, 0.55] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute inset-[-10px] rounded-[28px]"
                    style={{ border: "1px solid rgba(16,185,129,0.15)" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 7.5, ease: "linear", repeat: Infinity }}
                  />

                  <motion.svg
                    className="absolute inset-0 m-auto"
                    width="38" height="38" viewBox="0 0 24 24" fill="none"
                    aria-hidden="true"
                    initial="hidden"
                    animate="show"
                  >
                    <motion.path
                      d="M7.5 12.2L10.3 15L16.7 8.7"
                      stroke="rgb(16 185 129)"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      variants={{
                        hidden: { pathLength: 0, opacity: 0 },
                        show: { pathLength: 1, opacity: 1 },
                      }}
                      transition={{ duration: 0.75, ease: "easeOut", delay: 0.22 }}
                    />
                  </motion.svg>
                </div>

                <motion.p
                  className="relative mt-4 text-center text-[17px] font-semibold text-[#f0ebe3] tracking-tight"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut", delay: 0.06 }}
                >
                  {title}
                </motion.p>
                <motion.p
                  className="relative mt-2 text-center text-sm text-[#8a7e72]"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut", delay: 0.1 }}
                >
                  {sub}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
