"use client";

/**
 * RecurringSeriesToggle
 *
 * Lets the admin opt this event into a "series" — one persistent URL
 * (mama.is/events/<slug>) that covers every recurrence. Without this,
 * each date would get its own dated slug and the URL would die when
 * that single instance ends, breaking any FB ad linking to it.
 *
 * Only meaningful when there is more than one date on the form. We
 * still render it on a single-date form, but show a hint instead of
 * the slug fields so the admin understands what to do.
 *
 * The toggle, slug, and recurrence label are owned by the parent
 * form (useEventForm) so they survive auto-save and submission.
 */
export default function RecurringSeriesToggle({
  isRecurring,
  setIsRecurring,
  seriesSlug,
  setSeriesSlug,
  recurrenceLabel,
  setRecurrenceLabel,
  hasMultipleDates,
}) {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-4 sm:p-6 border border-indigo-200">
      <h3 className="text-base sm:text-lg font-semibold text-indigo-800 mb-2 flex items-center gap-2">
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        One URL for all dates (recurring series)
      </h3>
      <p className="text-xs text-indigo-700/80 mb-3 sm:mb-4">
        Turn this on so a single permanent URL covers every session in this
        series. Use that URL in Facebook ads, posters, and event tickets — it
        keeps working as new dates roll in, even after older sessions end.
      </p>

      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={!!isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Make this a recurring series
          </span>
        </label>

        {isRecurring && !hasMultipleDates && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Add at least one extra date above (use{" "}
            <span className="font-semibold">+ Add another date</span>) for the
            series to take effect. With only one date this will be saved as a
            normal single event.
          </div>
        )}

        {isRecurring && (
          <div className="space-y-4 pl-6 border-l-2 border-indigo-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Series URL slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  mama.is/events/
                </span>
                <input
                  type="text"
                  value={seriesSlug || ""}
                  onChange={(e) => setSeriesSlug(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                  placeholder="qi-gong"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                This is the permanent URL for the whole series. Auto-filled
                from the event name — edit if you want a shorter or cleaner
                version. Lowercase letters, numbers, and dashes only.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recurrence label{" "}
                <span className="text-xs font-normal text-gray-500">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={recurrenceLabel || ""}
                onChange={(e) => setRecurrenceLabel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                placeholder="Every Tuesday · 18:00"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Shown on the series page so visitors know the cadence.
                Plain text — write it however reads best.
              </p>
            </div>

            <p className="text-xs text-indigo-700 bg-indigo-50 p-3 rounded-lg">
              💡 When this is on, every date you add becomes a session under
              the same series URL. The series page shows the next upcoming
              session as the default booking option, with a list of all
              upcoming dates underneath.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
