"use client";

import Link from "next/link";
import useAdminBookingForm from "../hooks/useAdminBookingForm";

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-800">{label}</label>
      {children}
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function AdminBookingForm({
  mode, // "create" | "edit"
  bookingRef,
  initialBooking,
  onSaved,
}) {
  const form = useAdminBookingForm(initialBooking, mode, bookingRef, onSaved);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
            White Lotus · Admin booking
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">
            {mode === "create"
              ? "New booking (internal)"
              : `Edit booking #${bookingRef}`}
          </h1>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Recommended filled: {form.handoverCompleteness.done}/
              {form.handoverCompleteness.total}
            </span>
            {mode === "edit" ? (
              <Link
                href={`/whitelotus/booking/${bookingRef}`}
                className="text-[#a77d3b] hover:underline"
              >
                Open dashboard
              </Link>
            ) : null}
          </div>
        </header>

        {form.saveError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {form.saveError}
          </div>
        ) : null}

        <Section title="Booking">
          <Field label="Name of Event / Company">
            <input
              value={form.eventNameOrCompany}
              onChange={(e) => form.setEventNameOrCompany(e.target.value)}
              placeholder="Event or company name"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
            />
          </Field>
          <Field label="Type of event">
            <input
              value={form.eventType}
              onChange={(e) => form.setEventType(e.target.value)}
              placeholder="e.g. birthday, yearly celebration"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
            />
          </Field>
        </Section>

        <Section title="Timing">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) => form.setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
              />
            </Field>
            <Field label="Start time">
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => form.setStartTime(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
              />
            </Field>
            <Field label="End time">
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => form.setEndTime(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="End-time policy"
              hint="Choose one: hard cutoff, flexible, or unsure."
            >
              <select
                value={form.endTimePolicy}
                onChange={(e) => form.setEndTimePolicy(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
              >
                <option value="unsure">Unsure</option>
                <option value="hardCutoff">
                  Hard cutoff (lights on / clear venue at end time)
                </option>
                <option value="canStayLate">Flexible</option>
              </select>
            </Field>
            <Field
              label="Latest exit time (optional)"
              hint="Only if ‘Flexible’ is selected."
            >
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="time"
                  value={form.latestExitTime}
                  onChange={(e) => form.setLatestExitTime(e.target.value)}
                  disabled={form.endTimePolicy !== "canStayLate"}
                  className="w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b] disabled:opacity-50 sm:w-auto"
                />
                {form.latestExitTime && form.endTimePolicy === "canStayLate" ? (
                  <button
                    type="button"
                    onClick={() => form.setLatestExitTime("")}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </Field>
          </div>
        </Section>

        <Section title="Guests & staffing">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Guest quantity (text)">
              <input
                value={form.guestCount}
                onChange={(e) => form.setGuestCount(e.target.value)}
                placeholder="e.g. 80–90 pax"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
              />
            </Field>
            <Field label="How many staff are needed?">
              <input
                value={form.staffNeeded}
                onChange={(e) => form.setStaffNeeded(e.target.value)}
                placeholder="e.g. 3 (1 bar, 2 floor)"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
              />
            </Field>
          </div>
          <Field label="Comment">
            <textarea
              value={form.guestStaffComment}
              onChange={(e) => form.setGuestStaffComment(e.target.value)}
              rows={3}
              placeholder="Optional notes on guests or staffing"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
            />
          </Field>
        </Section>

        <Section title="Contacts">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Booking contact name">
              <input
                value={form.contactName}
                onChange={(e) => form.setContactName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
              />
            </Field>
            <Field label="Booking contact phone">
              <input
                value={form.contactPhone}
                onChange={(e) => form.setContactPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
              />
            </Field>
          </div>

          <Field label="Comment">
            <input
              type="text"
              value={form.contactComment}
              onChange={(e) => form.setContactComment(e.target.value)}
              placeholder="Optional note"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
            />
          </Field>

          <div className="flex justify-start">
            <button
              type="button"
              onClick={() =>
                form.setExtraContacts((prev) => [
                  ...(Array.isArray(prev) ? prev : []),
                  { name: "", phone: "", comment: "" },
                ])
              }
              className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition"
            >
              + Add contact
            </button>
          </div>

          {form.extraContacts.length > 0 ? (
            <div className="space-y-3">
              {form.extraContacts.map((c, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                    <input
                      value={c?.name || ""}
                      onChange={(e) =>
                        form.setExtraContacts((prev) =>
                          prev.map((row, i) =>
                            i === idx
                              ? { ...(row || {}), name: e.target.value }
                              : row,
                          ),
                        )
                      }
                      placeholder="Name"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
                    />
                    <input
                      value={c?.phone || ""}
                      onChange={(e) =>
                        form.setExtraContacts((prev) =>
                          prev.map((row, i) =>
                            i === idx
                              ? { ...(row || {}), phone: e.target.value }
                              : row,
                          ),
                        )
                      }
                      placeholder="Phone"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
                    />
                  </div>
                  <div className="mt-3">
                    <input
                      type="text"
                      value={c?.comment || ""}
                      onChange={(e) =>
                        form.setExtraContacts((prev) =>
                          prev.map((row, i) =>
                            i === idx
                              ? { ...(row || {}), comment: e.target.value }
                              : row,
                          ),
                        )
                      }
                      placeholder="Comment"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
                    />
                  </div>
                  <div className="mt-3 flex justify-start">
                    <button
                      type="button"
                      onClick={() =>
                        form.setExtraContacts((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                      aria-label="Remove contact"
                    >
                      <span aria-hidden className="text-sm leading-none">×</span>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Section>

        <Section title="Drinks">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.hasDrinks}
              onChange={(e) => form.setHasDrinks(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#a77d3b] focus:ring-[#a77d3b]"
            />
            <span className="text-sm font-medium text-gray-800">
              There will be drinks
            </span>
          </label>

          {form.hasDrinks ? (
            <div className="mt-4 space-y-4">
              <Field label="What has been prepaid?">
                <textarea
                  value={form.drinksPrepaid}
                  onChange={(e) => form.setDrinksPrepaid(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
                />
              </Field>
              <Field label="What should be available?">
                <textarea
                  value={form.drinksAvailable}
                  onChange={(e) => form.setDrinksAvailable(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
                />
              </Field>
              <Field label="Any pre-drinks plan?">
                <textarea
                  value={form.preDrinksPlan}
                  onChange={(e) => form.setPreDrinksPlan(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
                />
              </Field>
              <Field label="Will they bring something themselves?">
                <textarea
                  value={form.bringingOwnItems}
                  onChange={(e) => form.setBringingOwnItems(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
                />
              </Field>
            </div>
          ) : null}
        </Section>

        <Section title="Food">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.hasFood}
              onChange={(e) => form.setHasFood(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#a77d3b] focus:ring-[#a77d3b]"
            />
            <span className="text-sm font-medium text-gray-800">
              There will be food
            </span>
          </label>

          {form.hasFood ? (
            <div className="mt-4 space-y-4">
              <Field label="What did they select?">
                <select
                  value={form.foodSelection}
                  onChange={(e) => form.setFoodSelection(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
                >
                  <option value="">—</option>
                  <option value="fingerfood">Fingerfood</option>
                  <option value="buffet">Buffet</option>
                  <option value="tableService">Table service</option>
                </select>
              </Field>
              <Field label="Menu:">
                <textarea
                  value={form.foodMenu}
                  onChange={(e) => form.setFoodMenu(e.target.value)}
                  rows={4}
                  placeholder="Menu or dishes"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
                />
              </Field>
              <Field label="Number of servings:">
                <input
                  type="text"
                  value={form.peopleCount}
                  onChange={(e) => form.setPeopleCount(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
                />
              </Field>
              <Field label="Allergies summary">
                <textarea
                  value={form.allergiesSummary}
                  onChange={(e) => form.setAllergiesSummary(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
                />
              </Field>
              <Field label="Anything else?">
                <textarea
                  value={form.foodOther}
                  onChange={(e) => form.setFoodOther(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Chef name (optional)">
                  <input
                    value={form.chefName}
                    onChange={(e) => form.setChefName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
                  />
                </Field>
                <Field label="Chef phone (optional)">
                  <input
                    value={form.chefPhone}
                    onChange={(e) => form.setChefPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
                  />
                </Field>
              </div>
            </div>
          ) : null}
        </Section>

        <Section title="Space" description="Setup style and table / decoration.">
          <Field label="Setup style">
            <textarea
              value={form.spaceSetup}
              onChange={(e) => form.setSpaceSetup(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
            />
          </Field>
          <Field label="Table style / decoration notes">
            <textarea
              value={form.tableStyleNotes}
              onChange={(e) => form.setTableStyleNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
            />
          </Field>
        </Section>

        <Section title="Tech" description="Soundsystem, lights, projector, musician/DJ and technical notes.">
          <div className="flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.soundsystemCheck}
                onChange={(e) => form.setSoundsystemCheck(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#a77d3b] focus:ring-[#a77d3b]"
              />
              <span className="text-sm font-medium text-gray-800">Soundsystem</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.lightsDiscoCheck}
                onChange={(e) => form.setLightsDiscoCheck(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#a77d3b] focus:ring-[#a77d3b]"
              />
              <span className="text-sm font-medium text-gray-800">Lights and disco</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.projectorCheck}
                onChange={(e) => form.setProjectorCheck(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#a77d3b] focus:ring-[#a77d3b]"
              />
              <span className="text-sm font-medium text-gray-800">Projector</span>
            </label>
          </div>
          <Field label="Musician / DJ - Soundcheck?">
            <textarea
              value={form.musicianOrDJ}
              onChange={(e) => form.setMusicianOrDJ(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
            />
          </Field>
          <Field label="Tech notes / what’s needed / what’s available">
            <textarea
              value={form.techNotes}
              onChange={(e) => form.setTechNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]"
            />
          </Field>
        </Section>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={form.handleSave}
            disabled={form.saving}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#a77d3b] px-6 py-3 text-sm font-semibold text-white hover:bg-[#8b6a2f] transition disabled:opacity-50"
          >
            {form.saving
              ? "Saving…"
              : mode === "create"
                ? "Create booking"
                : "Save changes"}
          </button>
          {form.savedRef ? (
            <Link
              href={`/whitelotus/booking/${form.savedRef}`}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
            >
              Open dashboard
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
