"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import AdminGuard from "@/app/admin/AdminGuard";
import { AdminShell, AdminHeader } from "@/app/admin/components/AdminShell";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";

/**
 * Series management + backfill tool.
 *
 * Two sections:
 *   1. Existing series — quick view of what's bound, what's next.
 *   2. "Group existing events into a new series" — pick rows, name the
 *      series, set the slug, click create. The API binds them in one go
 *      and returns the canonical ad URL.
 */
export default function ManageSeries({
  initialSeries,
  initialEvents,
  serverLoadError,
}) {
  const [series, setSeries] = useState(initialSeries || []);
  const [events] = useState(initialEvents || []);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [recurrenceLabel, setRecurrenceLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all"); // all | unbound | bound

  // Auto-derive slug from the typed name unless the admin has hand-edited it.
  const [slugTouched, setSlugTouched] = useState(false);
  const slugify = (v) =>
    String(v || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleNameChange = (value) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const filteredEvents = useMemo(() => {
    let list = events;
    if (filter === "unbound") list = list.filter((e) => !e.series_id);
    if (filter === "bound") list = list.filter((e) => e.series_id);
    return list;
  }, [events, filter]);

  const eventCountBySeries = useMemo(() => {
    const map = new Map();
    for (const e of events) {
      if (e.series_id) {
        map.set(e.series_id, (map.get(e.series_id) || 0) + 1);
      }
    }
    return map;
  }, [events]);

  const nextSessionBySeries = useMemo(() => {
    const map = new Map();
    const now = Date.now();
    const upcoming = events
      .filter((e) => e.series_id && new Date(e.date).getTime() > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    for (const e of upcoming) {
      if (!map.has(e.series_id)) map.set(e.series_id, e);
    }
    return map;
  }, [events]);

  const toggleEvent = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateSeries = async () => {
    if (!name.trim()) {
      toast.error("Series name is required");
      return;
    }
    if (!slug.trim()) {
      toast.error("Series slug is required");
      return;
    }
    if (selectedIds.size < 1) {
      toast.error("Select at least one event to group");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/events/group-into-series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          recurrence_label: recurrenceLabel.trim() || null,
          event_ids: Array.from(selectedIds),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to create series");
      }
      toast.success(
        `Series created with ${data.bound_event_count} sessions. Ad URL: ${data.ad_url}`
      );
      setSeries((prev) => [data.series, ...prev]);
      setSelectedIds(new Set());
      setName("");
      setSlug("");
      setRecurrenceLabel("");
      setSlugTouched(false);
      // Reload so events list reflects the new bindings.
      if (typeof window !== "undefined") {
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (serverLoadError) {
    return (
      <AdminGuard>
        <AdminShell>
          <AdminHeader
            eyebrow="Admin · Series"
            title="Manage Series"
            subtitle={serverLoadError}
          />
        </AdminShell>
      </AdminGuard>
    );
  }

  if (submitting) return <LoadingSpinner />;

  return (
    <AdminGuard>
      <AdminShell maxWidth="max-w-5xl">
        <AdminHeader
          eyebrow="Admin · Events"
          title="Manage series"
          subtitle="One persistent URL covers every recurring date — perfect for ads and Facebook events."
        />

        {/* ── Existing series ──────────────────────────────────── */}
        <section className="mt-6">
          <h2 className="text-base font-semibold text-[#2c1810] mb-3">
            Existing series
          </h2>
          {series.length === 0 ? (
            <p className="text-sm text-[#9a7a62] italic">
              No series yet — create one below by grouping existing events,
              or use the &quot;Make this a recurring series&quot; toggle on the
              create-event form for new ones.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#e8ddd3]">
              <table className="w-full text-sm">
                <thead className="bg-[#faf6f2] text-[#9a7a62] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Series</th>
                    <th className="px-4 py-3 text-left">Ad URL</th>
                    <th className="px-4 py-3 text-left">Cadence</th>
                    <th className="px-4 py-3 text-left">Sessions</th>
                    <th className="px-4 py-3 text-left">Next</th>
                    <th className="px-4 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {series.map((s) => {
                    const next = nextSessionBySeries.get(s.id);
                    return (
                      <tr key={s.id} className="border-t border-[#e8ddd3]">
                        <td className="px-4 py-3 text-[#2c1810] font-medium">
                          {s.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[#ff914d]">
                          mama.is/events/{s.slug}
                        </td>
                        <td className="px-4 py-3 text-[#9a7a62]">
                          {s.recurrence_label || "—"}
                        </td>
                        <td className="px-4 py-3 text-[#9a7a62]">
                          {eventCountBySeries.get(s.id) || 0}
                        </td>
                        <td className="px-4 py-3 text-[#9a7a62]">
                          {next
                            ? format(new Date(next.date), "MMM d · h:mm a")
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/events/${s.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-[#ff914d] hover:underline"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Backfill tool ────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-base font-semibold text-[#2c1810] mb-3">
            Group existing events into a new series
          </h2>
          <p className="text-sm text-[#9a7a62] mb-4">
            Pick the events that belong together (e.g. every Qi Gong row
            you&apos;ve already created), name the series, choose a clean URL
            slug, and click <span className="font-semibold">Create series</span>.
            The events stay where they are — they just get linked under one
            persistent URL.
          </p>

          <div className="rounded-xl border border-[#e8ddd3] bg-[#faf6f2] p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium tracking-wide text-[#9a7a62] mb-1">
                  Series name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-[#e8ddd3] focus:ring-2 focus:ring-[#ff914d]/40 focus:border-[#ff914d] bg-white"
                  placeholder="Qi Gong"
                />
              </div>
              <div>
                <label className="block text-xs font-medium tracking-wide text-[#9a7a62] mb-1">
                  Series URL slug
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e8ddd3] bg-white">
                  <span className="text-xs text-[#9a7a62] whitespace-nowrap">
                    mama.is/events/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugify(e.target.value));
                    }}
                    className="flex-1 outline-none text-sm bg-transparent"
                    placeholder="qi-gong"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wide text-[#9a7a62] mb-1">
                Cadence (optional)
              </label>
              <input
                type="text"
                value={recurrenceLabel}
                onChange={(e) => setRecurrenceLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm border border-[#e8ddd3] focus:ring-2 focus:ring-[#ff914d]/40 focus:border-[#ff914d] bg-white"
                placeholder="Every Tuesday · 18:00"
              />
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium tracking-wide text-[#9a7a62]">
                  Pick events to bind ({selectedIds.size} selected)
                </label>
                <div className="flex gap-1 text-xs">
                  {[
                    { v: "all", label: "All" },
                    { v: "unbound", label: "Not in a series" },
                    { v: "bound", label: "Already in a series" },
                  ].map((tab) => (
                    <button
                      type="button"
                      key={tab.v}
                      onClick={() => setFilter(tab.v)}
                      className={`px-3 py-1 rounded-full transition-colors ${
                        filter === tab.v
                          ? "bg-[#ff914d] text-black font-semibold"
                          : "bg-white text-[#9a7a62] border border-[#e8ddd3]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto rounded-lg border border-[#e8ddd3] bg-white">
                {filteredEvents.length === 0 ? (
                  <p className="p-4 text-sm text-[#9a7a62] italic">
                    No events match this filter.
                  </p>
                ) : (
                  <ul className="divide-y divide-[#f0e6d8]">
                    {filteredEvents.map((e) => {
                      const checked = selectedIds.has(e.id);
                      const past = new Date(e.date) < new Date();
                      return (
                        <li
                          key={e.id}
                          className={`flex items-center gap-3 px-3 py-2.5 ${
                            checked ? "bg-[#ff914d]/[0.05]" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleEvent(e.id)}
                            className="w-4 h-4 accent-[#ff914d]"
                          />
                          <button
                            type="button"
                            onClick={() => toggleEvent(e.id)}
                            className="flex-1 text-left"
                          >
                            <div className="text-sm text-[#2c1810]">
                              {e.name}
                              {e.series_id && (
                                <span className="ml-2 text-[10px] uppercase tracking-wider text-[#ff914d]">
                                  · already bound
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#9a7a62]">
                              {format(new Date(e.date), "EEE MMM d · h:mm a")}
                              {past ? " · past" : ""}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={submitting || selectedIds.size < 1 || !name.trim() || !slug.trim()}
                onClick={handleCreateSeries}
                className="px-5 py-2.5 rounded-full bg-[#ff914d] text-black text-sm font-semibold uppercase tracking-wider hover:bg-[#ff7a2e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create series
              </button>
            </div>
          </div>
        </section>
      </AdminShell>
    </AdminGuard>
  );
}
