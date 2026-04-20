"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function TicketConfirmation() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <div className="min-h-screen bg-[#1a1208] flex flex-col" data-navbar-theme="dark">

      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full text-center"
        >
          {/* Checkmark */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
          >
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex items-center justify-center gap-3 mb-5"
          >
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
            <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">Ticket confirmed</span>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="font-cormorant font-light italic text-[#f0ebe3] mb-5 leading-tight"
            style={{ fontSize: "clamp(2rem, 6vw, 3rem)" }}
          >
            Congratulations!
          </motion.h1>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="text-[#a09488] text-sm leading-relaxed mb-10"
          >
            Your ticket has been sent to your email address. You can also access
            it anytime through your profile page.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href={isAuthenticated ? "/profile/my-tickets" : "/auth"}
              className="inline-flex items-center justify-center px-7 py-3 bg-[#ff914d] text-black text-sm font-medium tracking-[0.12em] uppercase rounded-full hover:bg-[#ff7a2e] transition-colors duration-200"
            >
              {isAuthenticated ? "View My Tickets" : "Sign In / Register"}
            </Link>

            <Link
              href="/events"
              className="inline-flex items-center justify-center px-7 py-3 border border-[#f0ebe3]/25 text-[#f0ebe3] text-sm tracking-[0.12em] uppercase rounded-full hover:bg-[#f0ebe3]/[0.07] hover:border-[#f0ebe3]/40 transition-all duration-200"
            >
              Explore More Events
            </Link>
          </motion.div>

          {/* Closing line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-[#7a6a5a] text-xs tracking-[0.2em] uppercase mt-10"
          >
            We look forward to seeing you at the event
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
