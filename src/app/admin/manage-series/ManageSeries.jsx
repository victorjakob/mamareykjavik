"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import AdminGuard from "@/app/admin/AdminGuard";
import { AdminShell, AdminHeader } from "@/app/admin/components/AdminShell";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatEventDate = (value) => {
  if (!value) return "No date";
  try {
    return format(new Date(value), "EEE MMM d · h:mm a");
  } catch {
    return String(value);
  }
};

const toDateTimeLocal = (date) => {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const makeId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const newDateInput = () => ({ id: makeId(), value: "" });

function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-white text-[#7a5a42] ring-[#eadfd2]",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-800 ring-amber-100",
    slate: "bg-slate-50 text-slate-600 ring-slate-200",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default function ManageSeries({
  initialSeries,
  initialEvents,
  serverLoadError,
}) {
  const [series, setSeries] = useState(initialSeries || []);
  const [events, setEvents] = useState(initialEvents || []);
  const [selectedSeriesId, setSelectedSeriesId] = useState(
    initialSeries?.[0]?.id || ""
  );
  const [mode, setMode] = useState("add"); // add | attach | create
  const [busy, setBusy] = useState(false);

  const [sessionDates, setSessionDates] = useState([newDateInput()]);
  const [attachFilter, setAttachFilter] = useState("unbound"); // unbound | other | all
  const [attachSearch, setAttachSearch] = useState("");
  const [attachIds, setAttachIds] = useState(new Set());

  const [createIds, setCreateIds] = useState(new Set());
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createRecurrenceLabel, setCreateRecurrenceLabel] = useState("");
  const [createSlugTouched, setCreateSlugTouched] = useState(false);

  const selectedSeries = useMemo(
    () => series.find((item) => item.id === selectedSeriesId) || null,
    [series, selectedSeriesId]
  );

  const eventsBySeries = useMemo(() => {
    const map = new Map();
    for (const event of events) {
      if (!event.series_id) continue;
      if (!map.has(event.series_id)) map.set(event.series_id, []);
      map.get(event.series_id).push(event);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    return map;
  }, [events]);

  const seriesStats = useMemo(() => {
    const now = Date.now();
    const map = new Map();
    for (const item of series) {
      const list = eventsBySeries.get(item.id) || [];
      const upcoming = list.filter((event) => new Date(event.date).getTime() > now);
      map.set(item.id, {
        total: list.length,
        upcoming: upcoming.length,
        next: upcoming[0] || null,
        latest: list[list.length - 1] || null,
      });
    }
    return map;
  }, [eventsBySeries, series]);

  const selectedSeriesEvents = selectedSeries
    ? eventsBySeries.get(selectedSeries.id) || []
    : [];
  const selectedStats = selectedSeries ? seriesStats.get(selectedSeries.id) : null;
  const templateEvent = selectedStats?.latest || selectedSeriesEvents[0] || null;

  const attachableEvents = useMemo(() => {
    const query = attachSearch.trim().toLowerCase();
    return events
      .filter((event) => {
        if (!selectedSeries) return false;
        if (event.series_id === selectedSeries.id) return false;
        if (attachFilter === "unbound" && event.series_id) return false;
        if (attachFilter === "other" && !event.series_id) return false;
        if (!query) return true;
        return [event.name, event.slug, event.host]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [attachFilter, attachSearch, events, selectedSeries]);

  const createCandidates = useMemo(
    () =>
      events
        .filter((event) => !event.series_id)
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [events]
  );

  const validSessionDates = sessionDates
    .map((item) => item.value)
    .filter(Boolean)
    .map((value) => new Date(value).toISOString());

  const updateSessionDate = (id, value) => {
    setSessionDates((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value } : item))
    );
  };

  const addDateAfterLatest = () => {
    const latestValue = sessionDates
      .map((item) => item.value)
      .filter(Boolean)
      .sort()
      .at(-1);
    const base = latestValue
      ? new Date(latestValue)
      : templateEvent?.date
        ? new Date(templateEvent.date)
        : new Date();
    base.setDate(base.getDate() + 7);
    while (base.getTime() <= Date.now()) {
      base.setDate(base.getDate() + 7);
    }
    setSessionDates((prev) => [
      ...prev,
      { id: makeId(), value: toDateTimeLocal(base) },
    ]);
  };

  const toggleSet = (setter, id) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateName = (value) => {
    setCreateName(value);
    if (!createSlugTouched) setCreateSlug(slugify(value));
  };

  const refreshSeriesSelection = (nextSeriesId) => {
    if (nextSeriesId) setSelectedSeriesId(nextSeriesId);
    setAttachIds(new Set());
    setSessionDates([newDateInput()]);
  };

  const createSessions = async () => {
    if (!selectedSeries) return;
    if (validSessionDates.length === 0) {
      toast.error("Add at least one future date/time");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`/api/events/series/${selectedSeries.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createSessions",
          dates: validSessionDates,
          template_event_id: templateEvent?.id || null,
        }),
      });
      const data = await response.json();
      if (!response.ok && response.status !== 207) {
        throw new Error(data?.message || "Could not create sessions");
      }

      const createdEvents = data.created_events || [];
      setEvents((prev) =>
        [...prev, ...createdEvents].sort((a, b) => new Date(a.date) - new Date(b.date))
      );
      setSessionDates([newDateInput()]);
      toast.success(
        `${createdEvents.length} session${createdEvents.length === 1 ? "" : "s"} added`
      );
      if (data?.message) toast(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const attachEvents = async () => {
    if (!selectedSeries) return;
    if (attachIds.size === 0) {
      toast.error("Choose at least one event to attach");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`/api/events/series/${selectedSeries.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "attachEvents",
          event_ids: Array.from(attachIds),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Could not attach events");

      setEvents((prev) =>
        prev.map((event) =>
          attachIds.has(event.id) ? { ...event, series_id: selectedSeries.id } : event
        )
      );
      setAttachIds(new Set());
      toast.success(
        `${data.attached_event_count || 0} event${
          data.attached_event_count === 1 ? "" : "s"
        } attached`
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const createSeries = async () => {
    if (!createName.trim()) return toast.error("Series name is required");
    if (!createSlug.trim()) return toast.error("Series slug is required");
    if (createIds.size < 1) return toast.error("Select at least one event");

    setBusy(true);
    try {
      const response = await fetch("/api/events/group-into-series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          slug: createSlug.trim(),
          recurrence_label: createRecurrenceLabel.trim() || null,
          event_ids: Array.from(createIds),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to create series");

      setSeries((prev) => [data.series, ...prev]);
      setEvents((prev) =>
        prev.map((event) =>
          createIds.has(event.id) ? { ...event, series_id: data.series.id } : event
        )
      );
      setCreateIds(new Set());
      setCreateName("");
      setCreateSlug("");
      setCreateRecurrenceLabel("");
      setCreateSlugTouched(false);
      setMode("add");
      refreshSeriesSelection(data.series.id);
      toast.success(`Series created with ${data.bound_event_count} sessions`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
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

  if (busy) return <LoadingSpinner />;

  return (
    <AdminGuard>
      <AdminShell maxWidth="max-w-6xl">
        <AdminHeader
          eyebrow="Admin · Events"
          title="Manage series"
          subtitle="Keep one public URL alive while adding new dates whenever the series continues."
          action={
            <Link
              href="/admin/create-event"
              className="rounded-full bg-[#ff914d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-[#ff7a2e]"
            >
              Create event
            </Link>
          }
        />

        <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {series.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e8ddd3] bg-white p-6 text-sm text-[#8a705c] md:col-span-2">
              No series yet. Create one below from existing events.
            </div>
          ) : (
            series.map((item) => {
              const stats = seriesStats.get(item.id) || {};
              const active = selectedSeriesId === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setSelectedSeriesId(item.id);
                    setMode("add");
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-[#ff914d] bg-[#fff7ef] shadow-sm"
                      : "border-[#eadfd2] bg-white hover:border-[#ff914d]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-cormorant text-2xl italic leading-tight text-[#2c1810]">
                        {item.name}
                      </h2>
                      <p className="mt-1 font-mono text-xs text-[#ff914d]">
                        mama.is/events/{item.slug}
                      </p>
                    </div>
                    <Pill tone={stats.upcoming > 0 ? "green" : "amber"}>
                      {stats.upcoming > 0 ? `${stats.upcoming} upcoming` : "needs dates"}
                    </Pill>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Pill>{stats.total || 0} total</Pill>
                    <Pill tone="slate">{item.recurrence_label || "No cadence"}</Pill>
                  </div>
                  <p className="mt-3 text-xs text-[#8a705c]">
                    Next: {stats.next ? formatEventDate(stats.next.date) : "No upcoming session"}
                  </p>
                </button>
              );
            })
          )}
        </section>

        {selectedSeries ? (
          <section className="mt-6 rounded-3xl border border-[#eadfd2] bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 border-b border-[#f0e6d8] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#ff914d]">
                  Selected series
                </p>
                <h2 className="mt-1 font-cormorant text-3xl italic text-[#2c1810]">
                  {selectedSeries.name}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/events/${selectedSeries.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[#eadfd2] px-4 py-2 text-xs font-semibold text-[#7a5a42] hover:bg-[#faf6f2]"
                >
                  View public page
                </Link>
                <button
                  type="button"
                  onClick={() => setMode("add")}
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    mode === "add"
                      ? "bg-[#2c1810] text-white"
                      : "bg-[#faf6f2] text-[#7a5a42]"
                  }`}
                >
                  Add dates
                </button>
                <button
                  type="button"
                  onClick={() => setMode("attach")}
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    mode === "attach"
                      ? "bg-[#2c1810] text-white"
                      : "bg-[#faf6f2] text-[#7a5a42]"
                  }`}
                >
                  Attach events
                </button>
              </div>
            </div>

            {mode === "add" ? (
              <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <h3 className="text-sm font-bold text-[#2c1810]">Add future sessions</h3>
                  <p className="mt-1 text-sm text-[#8a705c]">
                    New events copy details, ticket variants, host, image, pricing, and location from
                    the latest session in this series.
                  </p>

                  <div className="mt-4 space-y-2">
                    {sessionDates.map((item, index) => (
                      <div key={item.id} className="flex gap-2">
                        <input
                          type="datetime-local"
                          value={item.value}
                          onChange={(event) => updateSessionDate(item.id, event.target.value)}
                          className="w-full rounded-xl border border-[#eadfd2] bg-[#faf6f2] px-3 py-2 text-sm text-[#2c1810] outline-none focus:border-[#ff914d]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSessionDates((prev) =>
                              prev.length === 1
                                ? [newDateInput()]
                                : prev.filter((date) => date.id !== item.id)
                            )
                          }
                          className="rounded-xl border border-[#eadfd2] px-3 text-sm text-[#8a705c] hover:bg-[#faf6f2]"
                          aria-label={`Remove date ${index + 1}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSessionDates((prev) => [...prev, newDateInput()])}
                      className="rounded-full border border-[#eadfd2] px-4 py-2 text-xs font-semibold text-[#7a5a42] hover:bg-[#faf6f2]"
                    >
                      Add blank date
                    </button>
                    <button
                      type="button"
                      onClick={addDateAfterLatest}
                      className="rounded-full border border-[#eadfd2] px-4 py-2 text-xs font-semibold text-[#7a5a42] hover:bg-[#faf6f2]"
                    >
                      Add one week after latest
                    </button>
                    <button
                      type="button"
                      onClick={createSessions}
                      disabled={validSessionDates.length === 0}
                      className="rounded-full bg-[#ff914d] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black hover:bg-[#ff7a2e] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Create {validSessionDates.length || ""} session
                      {validSessionDates.length === 1 ? "" : "s"}
                    </button>
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-2xl bg-[#faf6f2] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9a724d]">
                        Current sessions
                      </p>
                      <Pill>{selectedSeriesEvents.length} total</Pill>
                    </div>
                    {selectedSeriesEvents.length === 0 ? (
                      <p className="mt-3 text-sm text-[#8a705c]">
                        No events are attached to this series yet.
                      </p>
                    ) : (
                      <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                        {selectedSeriesEvents.map((event) => {
                          const past = new Date(event.date).getTime() <= Date.now();
                          return (
                            <li
                              key={event.id}
                              className="rounded-xl border border-[#eadfd2] bg-white px-3 py-2"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-[#2c1810]">
                                    {formatEventDate(event.date)}
                                  </p>
                                  <p className="mt-0.5 text-xs text-[#8a705c]">{event.name}</p>
                                </div>
                                <Pill tone={past ? "slate" : "green"}>
                                  {past ? "past" : "upcoming"}
                                </Pill>
                              </div>
                              <Link
                                href={`/events/${event.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex text-xs font-semibold text-[#ff914d] hover:underline"
                              >
                                Open event
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-2xl bg-[#faf6f2] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9a724d]">
                      Template source
                    </p>
                    {templateEvent ? (
                      <div className="mt-3 text-sm text-[#2c1810]">
                        <p className="font-semibold">{templateEvent.name}</p>
                        <p className="mt-1 text-xs text-[#8a705c]">
                          Latest session: {formatEventDate(templateEvent.date)}
                        </p>
                        <p className="mt-3 text-xs text-[#8a705c]">
                          After creating, edit any individual event if one date needs a different host,
                          price, capacity, or Facebook link.
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-[#8a705c]">
                        This series has no session to copy yet. Attach an existing event first.
                      </p>
                    )}
                  </div>
                </aside>
              </div>
            ) : null}

            {mode === "attach" ? (
              <div className="mt-5">
                <h3 className="text-sm font-bold text-[#2c1810]">
                  Attach existing events to this series
                </h3>
                <p className="mt-1 text-sm text-[#8a705c]">
                  Use this if you already created the dates elsewhere, or if an old series has finished
                  and you made new event rows manually.
                </p>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <input
                    type="search"
                    value={attachSearch}
                    onChange={(event) => setAttachSearch(event.target.value)}
                    placeholder="Search event name, slug, host..."
                    className="w-full rounded-xl border border-[#eadfd2] px-3 py-2 text-sm outline-none focus:border-[#ff914d] sm:max-w-sm"
                  />
                  <div className="flex flex-wrap gap-1 text-xs">
                    {[
                      ["unbound", "Not in a series"],
                      ["other", "In another series"],
                      ["all", "All"],
                    ].map(([value, label]) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setAttachFilter(value)}
                        className={`rounded-full px-3 py-1.5 ${
                          attachFilter === value
                            ? "bg-[#2c1810] text-white"
                            : "bg-[#faf6f2] text-[#7a5a42]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 max-h-96 overflow-y-auto rounded-2xl border border-[#eadfd2]">
                  {attachableEvents.length === 0 ? (
                    <p className="p-4 text-sm text-[#8a705c]">No matching events.</p>
                  ) : (
                    <ul className="divide-y divide-[#f0e6d8]">
                      {attachableEvents.map((event) => {
                        const selected = attachIds.has(event.id);
                        return (
                          <li
                            key={event.id}
                            className={`flex items-center gap-3 px-4 py-3 ${
                              selected ? "bg-[#fff7ef]" : "bg-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleSet(setAttachIds, event.id)}
                              className="h-4 w-4 accent-[#ff914d]"
                            />
                            <button
                              type="button"
                              onClick={() => toggleSet(setAttachIds, event.id)}
                              className="flex-1 text-left"
                            >
                              <p className="text-sm font-semibold text-[#2c1810]">{event.name}</p>
                              <p className="text-xs text-[#8a705c]">
                                {formatEventDate(event.date)}
                                {event.series_id ? " · currently in another series" : ""}
                              </p>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={attachEvents}
                    disabled={attachIds.size === 0}
                    className="rounded-full bg-[#ff914d] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black hover:bg-[#ff7a2e] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Attach {attachIds.size || ""} event{attachIds.size === 1 ? "" : "s"}
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="mt-8 rounded-3xl border border-[#eadfd2] bg-[#faf6f2] p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setMode(mode === "create" ? "add" : "create")}
            className="flex w-full items-center justify-between text-left"
          >
            <span>
              <span className="block text-sm font-bold text-[#2c1810]">
                Create a new series from existing events
              </span>
              <span className="mt-1 block text-sm text-[#8a705c]">
                For one-time cleanup/backfill when events already exist but no series exists yet.
              </span>
            </span>
            <span className="text-xl text-[#8a705c]">{mode === "create" ? "−" : "+"}</span>
          </button>

          {mode === "create" ? (
            <div className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-[#9a724d]">
                    Series name
                  </span>
                  <input
                    value={createName}
                    onChange={(event) => handleCreateName(event.target.value)}
                    placeholder="Qi Gong"
                    className="w-full rounded-xl border border-[#eadfd2] bg-white px-3 py-2 outline-none focus:border-[#ff914d]"
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-[#9a724d]">
                    URL
                  </span>
                  <div className="flex rounded-xl border border-[#eadfd2] bg-white px-3 py-2">
                    <span className="text-xs text-[#8a705c]">mama.is/events/</span>
                    <input
                      value={createSlug}
                      onChange={(event) => {
                        setCreateSlugTouched(true);
                        setCreateSlug(slugify(event.target.value));
                      }}
                      placeholder="qi-gong"
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                </label>
              </div>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-[#9a724d]">
                  Cadence
                </span>
                <input
                  value={createRecurrenceLabel}
                  onChange={(event) => setCreateRecurrenceLabel(event.target.value)}
                  placeholder="Every Tuesday · 18:00"
                  className="w-full rounded-xl border border-[#eadfd2] bg-white px-3 py-2 outline-none focus:border-[#ff914d]"
                />
              </label>

              <div className="max-h-80 overflow-y-auto rounded-2xl border border-[#eadfd2] bg-white">
                {createCandidates.length === 0 ? (
                  <p className="p-4 text-sm text-[#8a705c]">No unbound events available.</p>
                ) : (
                  <ul className="divide-y divide-[#f0e6d8]">
                    {createCandidates.map((event) => {
                      const selected = createIds.has(event.id);
                      return (
                        <li
                          key={event.id}
                          className={`flex items-center gap-3 px-4 py-3 ${
                            selected ? "bg-[#fff7ef]" : "bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSet(setCreateIds, event.id)}
                            className="h-4 w-4 accent-[#ff914d]"
                          />
                          <button
                            type="button"
                            onClick={() => toggleSet(setCreateIds, event.id)}
                            className="flex-1 text-left"
                          >
                            <p className="text-sm font-semibold text-[#2c1810]">{event.name}</p>
                            <p className="text-xs text-[#8a705c]">{formatEventDate(event.date)}</p>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={createSeries}
                  disabled={createIds.size === 0 || !createName.trim() || !createSlug.trim()}
                  className="rounded-full bg-[#2c1810] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#4a2d20] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Create series
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </AdminShell>
    </AdminGuard>
  );
}
