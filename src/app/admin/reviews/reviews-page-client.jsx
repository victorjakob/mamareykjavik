"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Star, Trash2, Loader2 } from "lucide-react";
import { AdminShell, AdminHero } from "@/app/admin/components/AdminShell";

function segmentLabel(segment) {
  if (segment === "high") return "High";
  if (segment === "middle") return "Middle";
  if (segment === "low") return "Low";
  return "—";
}

function segmentPillStyle(segment) {
  if (segment === "high")
    return { background: "rgba(255,145,77,0.15)", color: "#ff914d", border: "1px solid rgba(255,145,77,0.3)" };
  if (segment === "middle")
    return { background: "rgba(255,145,77,0.08)", color: "#c0b4a8", border: "1px solid rgba(255,145,77,0.15)" };
  if (segment === "low")
    return { background: "rgba(255,107,107,0.1)", color: "#ff8080", border: "1px solid rgba(255,107,107,0.2)" };
  return { background: "rgba(255,255,255,0.05)", color: "#7a6a5a", border: "1px solid rgba(255,255,255,0.08)" };
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

function RatingChip({ label, value, suffix = "/5" }) {
  return (
    <div className="rounded-xl px-3 py-2 text-sm"
      style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
      <span className="text-[#9a7a62]">{label}: </span>
      <span className="font-semibold text-[#2c1810]">{value}</span>
      <span className="text-[#9a7a62] text-xs">{suffix}</span>
    </div>
  );
}

export default function ReviewsPageClient({ initialReviews }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reviews, setReviews] = useState(
    Array.isArray(initialReviews) ? initialReviews : []
  );
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: "", locale: "" });
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
    return () => { cancelled = true; };
  }, []);

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
    setConfirmDelete({ open: true, id: review?.id || "", locale: review?.locale || "" });
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
    <AdminShell maxWidth="max-w-5xl">
      <AdminHero
        eyebrow="Admin"
        title="Reviews"
        subtitle="Event feedback & satisfaction scores"
      />

        {/* Delete confirm modal */}
        {confirmDelete.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={closeDelete} />
            <div className="relative w-full max-w-[420px] rounded-2xl p-6 overflow-hidden"
              style={{
                background: "#ffffff",
                boxShadow: "0 30px 80px rgba(0,0,0,0.12)",
                border: "1.5px solid #f0e6d8",
              }}
            >
              <div className="h-[1.5px] absolute top-0 left-0 right-0"
                style={{ background: "linear-gradient(to right, rgba(255,107,107,0.5), transparent 60%)" }} />
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-9 h-9 flex items-center justify-center rounded-full shrink-0"
                  style={{ background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.2)" }}>
                  <Trash2 className="w-4 h-4 text-[#ff8080]" />
                </div>
                <div className="flex-1">
                  <h2 className="font-cormorant italic text-[#2c1810] text-xl font-light">Delete this review?</h2>
                  <p className="mt-1 text-sm text-[#9a7a62]">This action can't be undone. The review will be removed permanently.</p>
                  {confirmDelete.locale && (
                    <p className="mt-2 text-xs text-[#9a7a62]">Locale: {String(confirmDelete.locale).toUpperCase()}</p>
                  )}
                  {deleteError && (
                    <p className="mt-3 text-sm text-[#ff8080]">{deleteError}</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-2">
                <button type="button" onClick={closeDelete} disabled={deleteLoading}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-[#9a7a62] transition-colors"
                  style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
                  Cancel
                </button>
                <button type="button" onClick={confirmDeleteReview} disabled={deleteLoading}
                  className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "rgba(255,107,107,0.18)", color: "#ff8080", border: "1px solid rgba(255,107,107,0.3)" }}>
                  {deleteLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1.5" />Deleting…</> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {loadError && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm text-[#ff8080]"
            style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.15)" }}>
            {loadError}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">

          {/* Total + segments */}
          <div className="rounded-2xl overflow-hidden"
            style={{
              background: "#ffffff",
              border: "1.5px solid #f0e6d8",
              boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
            }}>
            <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
            <div className="p-5 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7a62]">Total</p>
              <p className="font-cormorant italic text-[#2c1810] text-4xl font-light mt-1">
                {loading ? "…" : stats.all}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <span className="rounded-full px-3 py-1 text-xs font-medium" style={segmentPillStyle("high")}>High {stats.high}</span>
                <span className="rounded-full px-3 py-1 text-xs font-medium" style={segmentPillStyle("middle")}>Mid {stats.middle}</span>
                <span className="rounded-full px-3 py-1 text-xs font-medium" style={segmentPillStyle("low")}>Low {stats.low}</span>
              </div>
            </div>
          </div>

          {/* Avg overall */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "#ffffff", border: "1.5px solid #f0e6d8", boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}>
            <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
            <div className="p-5 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7a62]">Avg Overall</p>
              <p className="font-cormorant italic text-[#2c1810] text-4xl font-light mt-1">
                {averages.overall.value === null ? "—" : averages.overall.value.toFixed(1)}
                <span className="text-base text-[#9a7a62]">/5</span>
              </p>
              <p className="mt-2 text-xs text-[#9a7a62]">Based on {averages.overall.n}</p>
            </div>
          </div>

          {/* Avg recommend */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "#ffffff", border: "1.5px solid #f0e6d8", boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}>
            <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
            <div className="p-5 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7a62]">Avg Recommend</p>
              <p className="font-cormorant italic text-[#2c1810] text-4xl font-light mt-1">
                {averages.recommend.value === null ? "—" : averages.recommend.value.toFixed(1)}
                <span className="text-base text-[#9a7a62]">/10</span>
              </p>
              <p className="mt-2 text-xs text-[#9a7a62]">Based on {averages.recommend.n}</p>
            </div>
          </div>

          {/* Optional ratings */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "#ffffff", border: "1.5px solid #f0e6d8", boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}>
            <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
            <div className="p-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a7a62] mb-3 text-center">Sub-ratings (avg)</p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  ["Booking", averages.booking.value],
                  ["Staff", averages.staff.value],
                  ["Clean", averages.clean.value],
                  ["Ambience", averages.ambience.value],
                  ["Tech", averages.tech.value],
                  ["Flow", averages.flow.value],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-lg px-2 py-1.5 text-center"
                    style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
                    <p className="text-[#9a7a62] text-[10px]">{label}</p>
                    <p className="text-[#2c1810] font-semibold">{val === null ? "—" : val.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-px mb-8" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.2), transparent)" }} />

        {/* Reviews list */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="rounded-2xl p-8 text-center"
              style={{ background: "#ffffff", border: "1.5px solid #f0e6d8" }}>
              <Loader2 className="w-6 h-6 text-[#ff914d] animate-spin mx-auto mb-3" />
              <p className="text-[#9a7a62] text-sm">Loading reviews…</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl p-8 text-center"
              style={{ background: "#ffffff", border: "1.5px solid #f0e6d8" }}>
              <Star className="w-8 h-8 text-[#e8ddd3] mx-auto mb-3" />
              <p className="text-[#9a7a62]">No reviews yet</p>
            </div>
          ) : (
            reviews.map((r) => {
              const overall = r.overall_stars ?? "—";
              const recommend = r.recommend_score ?? "—";
              const showImprove = hasAny(r.improve_one_thing);
              const showLowDetails = hasAny(r.low_satisfaction_details);
              const showFollowUp = hasAny(r.follow_up_contact) || hasAny(r.follow_up_name);
              const showBooking = showRating(r.booking_communication_stars);
              const showStaff = showRating(r.staff_service_stars);
              const showClean = showRating(r.space_cleanliness_stars);
              const showAmbience = showRating(r.ambience_vibe_stars);
              const showTech = showRating(r.tech_equipment_stars);
              const showFlow = showRating(r.flow_on_the_day_stars);
              const showValue = showRating(r.value_for_money_stars);
              const showBestPart = hasAny(r.best_part);
              const showExtra = showAmbience || showTech || showFlow || showValue || showBestPart;

              return (
                <div key={r.id} className="rounded-2xl overflow-hidden"
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #f0e6d8",
                    boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
                  }}>
                  <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.3), transparent 60%)" }} />
                  <div className="p-5">

                    {/* Top row */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                          style={segmentPillStyle(r.segment)}>
                          {segmentLabel(r.segment)}
                        </span>
                        <span className="text-sm font-semibold text-[#2c1810]">
                          Overall: <span className="text-[#ff914d]">{overall}</span> / 5
                        </span>
                        <span className="text-sm text-[#9a7a62]">
                          Recommend: <span className="font-semibold text-[#2c1810]">{recommend}</span> / 10
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span className="text-xs text-[#9a7a62]">{formatDate(r.created_at)}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#9a7a62]">
                            {r.locale?.toUpperCase?.() || "—"}
                          </span>
                          <button type="button" onClick={() => requestDelete(r)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors"
                            style={{ color: "#5a4a40" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#ff8080"; e.currentTarget.style.background = "rgba(255,107,107,0.1)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "#5a4a40"; e.currentTarget.style.background = "transparent"; }}
                            aria-label="Delete review">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Sub-rating chips */}
                    {(showBooking || showStaff || showClean) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {showBooking && <RatingChip label="Booking" value={r.booking_communication_stars} />}
                        {showStaff && <RatingChip label="Staff" value={r.staff_service_stars} />}
                        {showClean && <RatingChip label="Cleanliness" value={r.space_cleanliness_stars} />}
                      </div>
                    )}

                    {/* Content cards */}
                    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {showImprove && (
                        <div className="rounded-xl p-4" style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
                          <h3 className="text-xs font-semibold text-[#ff914d] uppercase tracking-wider mb-2">Improve</h3>
                          <p className="whitespace-pre-wrap text-sm text-[#2c1810] leading-relaxed">
                            {safeText(r.improve_one_thing)}
                          </p>
                        </div>
                      )}

                      {(showLowDetails || showFollowUp) && (
                        <div className="rounded-xl p-4" style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
                          <h3 className="text-xs font-semibold text-[#ff8080] uppercase tracking-wider mb-2">Low satisfaction</h3>
                          {showLowDetails && (
                            <p className="whitespace-pre-wrap text-sm text-[#2c1810] leading-relaxed">
                              {safeText(r.low_satisfaction_details)}
                            </p>
                          )}
                          {showFollowUp && (
                            <div className="mt-3 text-xs text-[#9a7a62] space-y-1">
                              {hasAny(r.follow_up_name) && (
                                <div>Name: <span className="font-semibold text-[#2c1810]">{safeText(r.follow_up_name)}</span></div>
                              )}
                              {hasAny(r.follow_up_contact) && (
                                <div>Contact: <span className="font-semibold text-[#2c1810]">{safeText(r.follow_up_contact)}</span></div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {showExtra && (
                        <div className="rounded-xl p-4 lg:col-span-2" style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
                          <h3 className="text-xs font-semibold text-[#9a7a62] uppercase tracking-wider mb-3">Extra details</h3>
                          {(showAmbience || showTech || showFlow || showValue) && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {showAmbience && <RatingChip label="Ambience" value={r.ambience_vibe_stars} />}
                              {showTech && <RatingChip label="Tech" value={r.tech_equipment_stars} />}
                              {showFlow && <RatingChip label="Flow" value={r.flow_on_the_day_stars} />}
                              {showValue && <RatingChip label="Value" value={r.value_for_money_stars} />}
                            </div>
                          )}
                          {showBestPart && (
                            <>
                              <h4 className="text-xs font-semibold text-[#ff914d] uppercase tracking-wider mb-2">Best part</h4>
                              <p className="whitespace-pre-wrap text-sm text-[#2c1810] leading-relaxed">
                                {safeText(r.best_part)}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
    </AdminShell>
  );
}
