"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Button({ href, label, children, ...props }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <Link
        href={href}
        className=" 
        bg-gradient-to-r rounded-full from-[#ff914d] via-[#ffa866] to-[#ff914d]
        hover:from-[#E68345] hover:via-[#E89A55] hover:to-[#E68345]
        hover:text-[#050301]
        text-[#3a1f0f] py-3 px-6 
        shadow-2xl     
        inline-block text-center font-medium
        transition duration-300 ease-in-out"
        {...props}
        aria-label={label}
      >
        {children}
      </Link>
    </motion.div>
  );
}

export function ButtonDark({ href, label, children, ...props }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <Link
        href={href}
        className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 
        hover:from-indigo-500 hover:via-indigo-400 hover:to-indigo-500
        hover:shadow-[0_0_10px_2px_rgba(79,70,229,0.5)]
        focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400
        text-white px-6 py-3 
        shadow-2xl 
        rounded-full inline-block text-center font-medium
        transition duration-300 ease-in-out"
        {...props}
        aria-label={label}
      >
        {children}
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
