"use client";

import { motion } from "framer-motion";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function Reveal({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={reveal}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
}) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={reveal}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`relative z-10 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 ${className}`}
    >
      {(eyebrow || title || description) && (
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#8f6f4f]">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="mt-3 text-3xl leading-tight text-[#20150f] sm:text-4xl">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-4 text-base leading-7 text-[#5e5047] sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
      )}
      {children}
    </motion.section>
  );
}

export function CTAButton({ href, onClick, children, variant = "primary", className = "" }) {
  const styles =
    variant === "secondary"
      ? "border border-[#bfa68e] bg-white/85 text-[#3d2a1f] hover:bg-white"
      : "border border-[#9a724d] bg-[#9a724d] text-white hover:bg-[#876243]";

  const sharedProps = {
    whileHover: { y: -2, scale: 1.01 },
    whileTap: { scale: 0.99 },
    transition: { type: "spring", stiffness: 320, damping: 24 },
    className: `inline-flex min-h-[48px] items-center justify-center rounded-full px-6 py-3 text-sm font-medium tracking-wide transition duration-300 ease-out shadow-[0_10px_30px_rgba(94,70,48,0.08)] ${styles} ${className}`,
  };

  if (onClick) {
    return (
      <motion.button type="button" onClick={onClick} {...sharedProps}>
        {children}
      </motion.button>
    );
  }

  return (
    <motion.a href={href} {...sharedProps}>
      {children}
    </motion.a>
  );
}

export function SoftCard({ title, content, className = "", delay = 0 }) {
  return (
    <motion.article
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={reveal}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      className={`rounded-[28px] border border-[#eadfd2] bg-white/80 p-6 shadow-[0_12px_40px_rgba(94,70,48,0.06)] backdrop-blur-sm ${className}`}
    >
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#9a724d]">
        {title}
      </p>
      <div className="mt-4 space-y-2 text-base leading-7 text-[#3d2a1f]">
        {content.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </motion.article>
  );
}

export function BulletList({ items, accent = "warm" }) {
  const bulletColor = accent === "dark" ? "bg-[#3d2a1f]" : "bg-[#b98f68]";

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[#4a3a30]">
          <span
            className={`mt-2 h-2 w-2 flex-none rounded-full ${bulletColor}`}
            aria-hidden="true"
          />
          <span className="leading-7">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PhotoCard({
  src,
  alt,
  className = "",
  imgClassName = "",
  priority = false,
  delay = 0,
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={reveal}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ y: -3 }}
      className={`overflow-hidden rounded-[28px] border border-white/70 bg-[#f4eadf] shadow-[0_18px_60px_rgba(94,70,48,0.14)] ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </motion.div>
  );
}

export function MoodPill({ children, className = "", delay = 0 }) {
  return (
    <Reveal
      delay={delay}
      className={`inline-flex self-start items-center rounded-full border border-[#d8c3ad] bg-white/80 px-4 py-2 text-sm text-[#5b473b] shadow-[0_8px_22px_rgba(94,70,48,0.06)] backdrop-blur-sm ${className}`}
    >
      {children}
    </Reveal>
  );
}
