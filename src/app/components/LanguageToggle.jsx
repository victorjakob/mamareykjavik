"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { usePathname, useRouter } from "next/navigation";
import {
  addIsPrefix,
  hasIsCounterpart,
  stripIsPrefix,
} from "@/lib/i18n-routing";

export default function LanguageToggle({ className = "" }) {
  const { setLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const canSwitch = hasIsCounterpart(pathname);
  if (!canSwitch) return null;

  const isIcelandicPath = pathname === "/is" || pathname?.startsWith("/is/");
  const basePath = stripIsPrefix(pathname);
  const targetPath = isIcelandicPath ? basePath : addIsPrefix(basePath);

  const handleClick = () => {
    setLanguage(isIcelandicPath ? "en" : "is");
    router.push(targetPath);
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ opacity: { duration: 0.6, ease: "easeOut", delay: 0.2 } }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-11 h-11 rounded-full transition-all duration-200 overflow-hidden flex items-center justify-center text-white lg:text-black text-xs font-medium ${className}`}
      aria-label={`Switch to ${isIcelandicPath ? "English" : "Icelandic"}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isIcelandicPath ? "is" : "en"}
          initial={{ opacity: 0, y: 10, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -10, rotateX: 90 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{
            transformStyle: "preserve-3d",
          }}
          className="inline-block"
        >
          {isIcelandicPath ? "IS" : "EN"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
