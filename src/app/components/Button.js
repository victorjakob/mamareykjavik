"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Button({ href, label, children, className = "", ...props }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="inline-block"
    >
      <Link
        href={href}
        className={`relative overflow-hidden rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white py-3 px-6 inline-block text-center font-medium transition-all duration-300 ease-in-out shadow-lg hover:bg-white/15 hover:border-white/30 hover:shadow-xl ${className}`}
        {...props}
        aria-label={label}
      >
        <span className="relative z-10">{children}</span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#ff914d]/20 via-[#ffa866]/20 to-[#ff914d]/20"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </Link>
    </motion.div>
  );
}

export function ButtonDark({
  href,
  label,
  children,
  className = "",
  ...props
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="inline-block"
    >
      <Link
        href={href}
        className={`relative overflow-hidden rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white px-6 py-3 shadow-lg hover:bg-white/15 hover:border-white/30 hover:shadow-xl inline-block text-center font-medium transition-all duration-300 ease-in-out ${className}`}
        {...props}
        aria-label={label}
      >
        <span className="relative z-10">{children}</span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-indigo-400/20 to-indigo-500/20"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </Link>
    </motion.div>
  );
}

export function ActionButton({
  onClick,
  label,
  children,
  className = "",
  ...props
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`border 
      bg-gradient-to-r from-[#ff914d] via-[#ffa866] to-[#ff914d]
      hover:from-[#E68345] hover:via-[#E89A55] hover:to-[#E68345]
      hover:text-[#050301]
      text-[#3a1f0f] py-3 px-6 
      shadow-2xl     
      rounded-md inline-block text-center
      transition duration-300 ease-in-out ${className}`}
      {...props}
      aria-label={label}
    >
      {children}
    </motion.button>
  );
}
