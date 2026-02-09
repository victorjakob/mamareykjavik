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
            className="absolute inset-0 bg-black/20 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-[380px]"
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-[28px] p-[1px] bg-gradient-to-br from-emerald-200/80 via-white/40 to-amber-200/60 shadow-[0_34px_90px_-54px_rgba(0,0,0,0.85)]">
              <div className="relative overflow-hidden rounded-[28px] border border-white/50 bg-white/85 backdrop-blur-xl px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(16,185,129,0.18)_0%,rgba(255,255,255,0)_60%)]" />
                <div className="pointer-events-none absolute -top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-emerald-200/30 blur-2xl" />

                <div className="relative mx-auto h-[76px] w-[76px]">
                  {/* slow, spacious sparkles */}
                  <motion.span
                    className="absolute -left-6 -top-3 h-2 w-2 rounded-full bg-emerald-300/70 blur-[0.2px]"
                    animate={{ y: [0, -10, 0], opacity: [0.25, 0.9, 0.25] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.span
                    className="absolute -right-4 top-1 h-1.5 w-1.5 rounded-full bg-amber-300/70 blur-[0.2px]"
                    animate={{ y: [0, -8, 0], opacity: [0.25, 0.85, 0.25] }}
                    transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  />
                  <motion.span
                    className="absolute left-2 -bottom-4 h-1.5 w-1.5 rounded-full bg-emerald-400/60 blur-[0.2px]"
                    animate={{ y: [0, 8, 0], opacity: [0.2, 0.75, 0.2] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
                  />

                  <motion.div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-100 via-white to-amber-100 ring-1 ring-emerald-200/70"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-3xl shadow-[0_18px_52px_-34px_rgba(16,185,129,0.9)]"
                    animate={{ opacity: [0.55, 0.9, 0.55] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* subtle halo sweep */}
                  <motion.div
                    className="absolute inset-[-10px] rounded-[28px] border border-emerald-200/40"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 7.5, ease: "linear", repeat: Infinity }}
                  />

                  <motion.svg
                    className="absolute inset-0 m-auto"
                    width="38"
                    height="38"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    initial="hidden"
                    animate="show"
                  >
                    <motion.path
                      d="M7.5 12.2L10.3 15L16.7 8.7"
                      stroke="rgb(5 150 105)"
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
                  className="relative mt-4 text-center text-[18px] font-semibold text-gray-900 tracking-tight"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut", delay: 0.06 }}
                >
                  {title}
                </motion.p>
                <motion.p
                  className="relative mt-2 text-center text-sm text-gray-600"
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
