"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import HeroReviewSection from "./HeroReviewSection";
import ReviewCard from "./ReviewCard";
import BottomInfoSection from "./BottomInfoSection";
import ExploreLinksSection from "./ExploreLinksSection";
import { fadeUp, staggerParent } from "./animations";

export default function ReviewsPageClient({
  language,
  t,
  reviews,
  featuredReviews,
  moreReviews,
  hasError,
  heroGallery,
  accentGallery,
}) {
  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#2f261f]">
      <HeroReviewSection t={t} heroGallery={heroGallery} />

      <section className="mx-auto max-w-6xl px-6 py-14 md:px-8 md:py-16">
        <motion.div
          className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">{t.featuredTitle}</h2>
            <p className="mt-2 text-[#6c5a48]">{t.featuredSubtitle}</p>
          </div>

          {!!reviews.length && (
            <p className="text-sm text-[#7b6855]">
              {reviews.length} {reviews.length === 1 ? t.reviewSuffix : t.reviewSuffixPlural} {t.displayed}
            </p>
          )}
        </motion.div>

        {hasError && (
          <div className="mb-10 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {t.loadError}
          </div>
        )}

        {!reviews.length ? (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="rounded-3xl border border-[#e8dfd2] bg-white p-8 text-center shadow-sm"
          >
            <h3 className="text-xl font-semibold">{t.emptyTitle}</h3>
            <p className="mt-3 text-[#6c5a48]">{t.emptyText}</p>
          </motion.div>
        ) : (
          <>
            {featuredReviews.length > 0 && (
              <motion.div
                className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
                variants={staggerParent}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
              >
                {featuredReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    featured
                    locale={language}
                    featuredLabel={t.featured}
                  />
                ))}
              </motion.div>
            )}

            {moreReviews.length > 0 && (
              <>
                <motion.div
                  className="mb-8 mt-16"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  <h2 className="text-2xl font-semibold md:text-3xl">{t.moreTitle}</h2>
                  <p className="mt-2 text-[#6c5a48]">{t.moreSubtitle}</p>
                </motion.div>

                <motion.div
                  className="mb-10 grid gap-4 md:grid-cols-3"
                  variants={staggerParent}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.1 }}
                >
                  {accentGallery.map((image) => (
                    <motion.div
                      key={image.src}
                      variants={fadeUp}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      whileHover={{ y: -3 }}
                      className="relative overflow-hidden rounded-3xl"
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={900}
                        height={520}
                        className="h-full min-h-[180px] w-full object-cover"
                      />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
                  variants={staggerParent}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.1 }}
                >
                  {moreReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} locale={language} featuredLabel={t.featured} />
                  ))}
                </motion.div>
              </>
            )}
          </>
        )}
      </section>

      <BottomInfoSection t={t} />
      <ExploreLinksSection t={t} />
    </main>
  );
}
