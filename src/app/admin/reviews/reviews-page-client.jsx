"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function segmentLabel(segment) {
  if (segment === "high") return "High";
  if (segment === "middle") return "Middle";
  if (segment === "low") return "Low";
  return "—";
}

function segmentPillClasses(segment) {
  if (segment === "high")
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  if (segment === "middle")
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  if (segment === "low") return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
}

function safeText(s) {
  return typeof s === "string" ? s : "";
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value || "");
  }
}

export default function ReviewsPageClient({ initialReviews }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reviews, setReviews] = useState(
    Array.isArray(initialReviews) ? initialReviews : []
  );
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: "",
    locale: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const res = await fetch("/api/admin/reviews");
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load reviews");
        if (cancelled) return;
        setReviews(Array.isArray(json?.reviews) ? json.reviews : []);
      } catch (e) {
        if (cancelled) return;
        setLoadError(e?.message || "Failed to load reviews");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = reviews;

  const stats = useMemo(() => {
    const base = Array.isArray(reviews) ? reviews : [];
    const by = { all: base.length, high: 0, middle: 0, low: 0 };
    for (const r of base) {
      if (r?.segment === "high") by.high += 1;
      else if (r?.segment === "middle") by.middle += 1;
      else if (r?.segment === "low") by.low += 1;
    }
    return by;
  }, [reviews]);

  const hasAny = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    return true;
  };

  const showRating = (n) => typeof n === "number" && Number.isFinite(n);

  const avg = (values) => {
    const nums = values.filter((v) => typeof v === "number" && Number.isFinite(v));
    if (nums.length === 0) return { value: null, n: 0 };
    const sum = nums.reduce((a, b) => a + b, 0);
    return { value: sum / nums.length, n: nums.length };
  };

  const averages = useMemo(() => {
    const base = Array.isArray(reviews) ? reviews : [];
    return {
      overall: avg(base.map((r) => r.overall_stars)),
      recommend: avg(base.map((r) => r.recommend_score)),
      booking: avg(base.map((r) => r.booking_communication_stars)),
      staff: avg(base.map((r) => r.staff_service_stars)),
      clean: avg(base.map((r) => r.space_cleanliness_stars)),
      ambience: avg(base.map((r) => r.ambience_vibe_stars)),
      tech: avg(base.map((r) => r.tech_equipment_stars)),
      flow: avg(base.map((r) => r.flow_on_the_day_stars)),
      value: avg(base.map((r) => r.value_for_money_stars)),
    };
  }, [reviews]);

  const requestDelete = (review) => {
    setDeleteError("");
    setConfirmDelete({
      open: true,
      id: review?.id || "",
      locale: review?.locale || "",
    });
  };

  const closeDelete = () => {
    if (deleteLoading) return;
    setConfirmDelete({ open: false, id: "", locale: "" });
    setDeleteError("");
  };

  const confirmDeleteReview = async () => {
    if (!confirmDelete.id || deleteLoading) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confirmDelete.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to delete review");
      setReviews((prev) => prev.filter((r) => r.id !== confirmDelete.id));
      setConfirmDelete({ open: false, id: "", locale: "" });
    } catch (e) {
      setDeleteError(e?.message || "Failed to delete review");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {confirmDelete.open ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
              <div
                className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
                onClick={closeDelete}
              />
              <div className="relative w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)] ring-1 ring-gray-200">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Delete this review?
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      This action can’t be undone. The review will be removed
                      permanently.
                    </p>
                    {confirmDelete.locale ? (
                      <p className="mt-2 text-xs text-gray-500">
                        Locale: {String(confirmDelete.locale).toUpperCase()}
                      </p>
                    ) : null}
                    {deleteError ? (
                      <p className="mt-3 text-sm font-semibold text-rose-600">
                        {deleteError}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeDelete}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteReview}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="w-full flex items-center justify-between">
              <div />
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                Reviews
              </h1>
              <Link
                href="/admin"
                className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
              >
                Back
              </Link>
            </div>
            {loadError ? (
              <p className="text-sm font-semibold text-rose-600">{loadError}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 text-center">
              <p className="text-xs font-semibold text-gray-500">Total</p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">
                {loading ? "…" : stats.all}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
                <span className="rounded-full bg-emerald-50 px-3 py-1 ring-1 ring-emerald-200 text-emerald-700">
                  High {stats.high}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 ring-1 ring-amber-200 text-amber-800">
                  Mid {stats.middle}
                </span>
                <span className="rounded-full bg-rose-50 px-3 py-1 ring-1 ring-rose-200 text-rose-700">
                  Low {stats.low}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 text-center">
              <p className="text-xs font-semibold text-gray-500">Avg overall</p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">
                {averages.overall.value === null
                  ? "—"
                  : averages.overall.value.toFixed(1)}
                <span className="text-base font-semibold text-gray-500">/5</span>
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Based on {averages.overall.n}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 text-center">
              <p className="text-xs font-semibold text-gray-500">Avg recommend</p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">
                {averages.recommend.value === null
                  ? "—"
                  : averages.recommend.value.toFixed(1)}
                <span className="text-base font-semibold text-gray-500">/10</span>
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Based on {averages.recommend.n}
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-5 shadow-sm ring-1 ring-gray-200">
              <p className="text-xs font-semibold text-gray-500 text-center">
                Optional ratings (avg)
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                <div className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-gray-200/70">
                  Booking{" "}
                  <span className="font-semibold">
                    {averages.booking.value === null ? "—" : averages.booking.value.toFixed(1)}
                  </span>
                </div>
                <div className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-gray-200/70">
                  Staff{" "}
                  <span className="font-semibold">
                    {averages.staff.value === null ? "—" : averages.staff.value.toFixed(1)}
                  </span>
                </div>
                <div className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-gray-200/70">
                  Clean{" "}
                  <span className="font-semibold">
                    {averages.clean.value === null ? "—" : averages.clean.value.toFixed(1)}
                  </span>
                </div>
                <div className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-gray-200/70">
                  Ambience{" "}
                  <span className="font-semibold">
                    {averages.ambience.value === null ? "—" : averages.ambience.value.toFixed(1)}
                  </span>
                </div>
                <div className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-gray-200/70">
                  Tech{" "}
                  <span className="font-semibold">
                    {averages.tech.value === null ? "—" : averages.tech.value.toFixed(1)}
                  </span>
                </div>
                <div className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-gray-200/70">
                  Flow{" "}
                  <span className="font-semibold">
                    {averages.flow.value === null ? "—" : averages.flow.value.toFixed(1)}
                  </span>
                </div>
                <div className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-gray-200/70 col-span-2">
                  Value{" "}
                  <span className="font-semibold">
                    {averages.value.value === null ? "—" : averages.value.value.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
                <p className="text-gray-700 font-semibold">Loading reviews…</p>
                <p className="mt-2 text-sm text-gray-500">
                  Pulling the latest submissions from Supabase.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
                <p className="text-gray-700 font-semibold">No reviews found</p>
                <p className="mt-2 text-sm text-gray-500">
                  Try clearing the search or switching segment.
                </p>
              </div>
            ) : (
              filtered.map((r) => {
                const overall = r.overall_stars ?? "—";
                const recommend = r.recommend_score ?? "—";

                const showImprove = hasAny(r.improve_one_thing);
                const showLowDetails = hasAny(r.low_satisfaction_details);
                const showFollowUp =
                  hasAny(r.follow_up_contact) || hasAny(r.follow_up_name);

                const showBooking = showRating(r.booking_communication_stars);
                const showStaff = showRating(r.staff_service_stars);
                const showClean = showRating(r.space_cleanliness_stars);

                const showAmbience = showRating(r.ambience_vibe_stars);
                const showTech = showRating(r.tech_equipment_stars);
                const showFlow = showRating(r.flow_on_the_day_stars);
                const showValue = showRating(r.value_for_money_stars);
                const showBestPart = hasAny(r.best_part);
                const showExtra =
                  showAmbience || showTech || showFlow || showValue || showBestPart;

                return (
                  <div
                    key={r.id}
                    className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                            segmentPillClasses(r.segment),
                          ].join(" ")}
                        >
                          {segmentLabel(r.segment)}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          Overall: {overall} / 5
                        </span>
                        <span className="text-sm text-gray-700">
                          Recommend: <span className="font-semibold">{recommend}</span>{" "}
                          / 10
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span className="text-xs text-gray-500">
                          {formatDate(r.created_at)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600">
                            {r.locale?.toUpperCase?.() || "—"}
                          </span>
                          <button
                            type="button"
                            onClick={() => requestDelete(r)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            aria-label="Delete review"
                            title="Delete review"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {(showBooking || showStaff || showClean) && (
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-700">
                        {showBooking ? (
                          <div className="rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-gray-200">
                            Booking:{" "}
                            <span className="font-semibold">
                              {r.booking_communication_stars}
                            </span>
                            /5
                          </div>
                        ) : null}
                        {showStaff ? (
                          <div className="rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-gray-200">
                            Staff:{" "}
                            <span className="font-semibold">
                              {r.staff_service_stars}
                            </span>
                            /5
                          </div>
                        ) : null}
                        {showClean ? (
                          <div className="rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-gray-200">
                            Cleanliness:{" "}
                            <span className="font-semibold">
                              {r.space_cleanliness_stars}
                            </span>
                            /5
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {showImprove ? (
                        <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-200">
                          <h3 className="text-sm font-bold text-gray-900">
                            Improve
                          </h3>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                            {safeText(r.improve_one_thing)}
                          </p>
                        </div>
                      ) : null}

                      {showLowDetails || showFollowUp ? (
                        <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-200">
                          <h3 className="text-sm font-bold text-gray-900">
                            Low satisfaction
                          </h3>
                          {showLowDetails ? (
                            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                              {safeText(r.low_satisfaction_details)}
                            </p>
                          ) : null}

                          {showFollowUp ? (
                            <div className="mt-3 text-xs text-gray-600 space-y-1">
                              {hasAny(r.follow_up_name) ? (
                                <div>
                                  Name:{" "}
                                  <span className="font-semibold">
                                    {safeText(r.follow_up_name)}
                                  </span>
                                </div>
                              ) : null}
                              {hasAny(r.follow_up_contact) ? (
                                <div>
                                  Contact:{" "}
                                  <span className="font-semibold">
                                    {safeText(r.follow_up_contact)}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {showExtra ? (
                        <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-200 lg:col-span-2">
                          <h3 className="text-sm font-bold text-gray-900">
                            Extra details
                          </h3>

                          {(showAmbience || showTech || showFlow || showValue) && (
                            <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-700">
                              {showAmbience ? (
                                <div className="rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-gray-200">
                                  Ambience:{" "}
                                  <span className="font-semibold">
                                    {r.ambience_vibe_stars}
                                  </span>
                                  /5
                                </div>
                              ) : null}
                              {showTech ? (
                                <div className="rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-gray-200">
                                  Tech:{" "}
                                  <span className="font-semibold">
                                    {r.tech_equipment_stars}
                                  </span>
                                  /5
                                </div>
                              ) : null}
                              {showFlow ? (
                                <div className="rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-gray-200">
                                  Flow:{" "}
                                  <span className="font-semibold">
                                    {r.flow_on_the_day_stars}
                                  </span>
                                  /5
                                </div>
                              ) : null}
                              {showValue ? (
                                <div className="rounded-xl bg-gray-50 px-3 py-2 ring-1 ring-gray-200">
                                  Value:{" "}
                                  <span className="font-semibold">
                                    {r.value_for_money_stars}
                                  </span>
                                  /5
                                </div>
                              ) : null}
                            </div>
                          )}

                          {showBestPart ? (
                            <>
                              <h4 className="mt-4 text-sm font-bold text-gray-900">
                                Best part
                              </h4>
                              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                                {safeText(r.best_part)}
                              </p>
                            </>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    {/* ID / updated removed (too noisy) */}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

