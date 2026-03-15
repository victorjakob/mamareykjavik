"use client";

import { motion } from "framer-motion";
import { fadeUp } from "./animations";

function StarRating({ rating = 5 }) {
  return (
    <div className="flex items-center gap-1 text-[#a77d3b]" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-lg leading-none">
          {i < Math.round(rating) ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export default function ReviewCard({ review, featured = false, locale = "en", featuredLabel = "Featured" }) {
  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={`rounded-3xl border border-[#e8dfd2] bg-white/90 shadow-sm transition hover:shadow-md ${
        featured ? "p-7" : "p-6"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <StarRating rating={review.rating} />
        {review.source && (
          <span className="rounded-full bg-[#f6f1ea] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#7f6440]">
            {review.source}
          </span>
        )}
      </div>

      <blockquote className="mb-5 text-base leading-7 text-[#3f352b]">"{review.review_text}"</blockquote>

      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold text-[#2f261f]">{review.reviewer_name}</p>

        {featured && (
          <span className="text-xs uppercase tracking-[0.2em] text-[#a77d3b]">
            {locale === "is" ? featuredLabel : "Featured"}
          </span>
        )}
      </div>
    </motion.article>
  );
}
