"use client";

import { useState } from "react";
import useAdminBookingForm from "../hooks/useAdminBookingForm";

const EMPTY = "\u2014";
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function formatValue(v) {
  if (v == null || v === "") return EMPTY;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) {
    if (v.length === 0) return EMPTY;
    return v
      .map((item) =>
        typeof item === "object" && item !== null
          ? [item.name, item.phone, item.comment].filter(Boolean).join(" \u00B7 ") || EMPTY
          : String(item)
      )
      .filter(Boolean)
      .join(" \u00B7 ");
  }
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function formatDateDisplay(iso) {
  if (!iso) return EMPTY;
  const s = String(iso).trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return s;
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[m - 1] || ""} ${y}`;
}

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-800">{label}</label>
      {children}
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#a77d3b]/30 focus:border-[#a77d3b]";

function SectionCard({ title, children, action }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  const v = formatValue(value);
  if (v === EMPTY) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3 sm:items-baseline">
      <dt className="shrink-0 text-sm text-gray-600 sm:min-w-[10rem]">{label}</dt>
      <dd className="break-words whitespace-pre-line text-sm text-gray-900">{v}</dd>
    </div>
  );
}

export default function AdminBookingEditView({ booking, bookingRef, onSaved }) {
  const form = useAdminBookingForm(booking, "edit", bookingRef, onSaved);
  const [editingSection, setEditingSection] = useState(null);

  const handleSectionSave = async () => {
    await form.handleSave();
    setEditingSection(null);
  };

  const bd = booking?.booking_data || {};
  const preferred = booking?.preferred_datetime || bd?.dateTime?.preferred;
  const displayDate = form.date ? formatDateDisplay(form.date) : formatDateDisplay(preferred);

  const endTimePolicyLabel =
    form.endTimePolicy === "hardCutoff" ? "Hard cutoff" : form.endTimePolicy === "canStayLate" ? "Flexible" : "Unsure";
  const dateTimeLine =
    [displayDate, form.startTime, form.endTime].filter(Boolean).length > 0
      ? [displayDate, form.startTime && form.endTime ? `${form.startTime} – ${form.endTime}` : form.startTime || form.endTime]
          .filter(Boolean)
          .join(", ")
      : null;
  const guestsRows = [
    ["Guest count", form.guestCount],
    ["Staff needed", form.staffNeeded],
    ["Comment", form.guestStaffComment],
  ];
  const drinksRows = [
    ["There will be drinks", form.hasDrinks],
    ["Prepaid", form.drinksPrepaid],
    ["Available", form.drinksAvailable],
    ["Pre-drinks plan", form.preDrinksPlan],
    ["Bringing own", form.bringingOwnItems],
  ];
  const foodSelectionLabel =
    form.foodSelection === "fingerfood"
      ? "Fingerfood"
      : form.foodSelection === "buffet"
        ? "Buffet"
        : form.foodSelection === "tableService"
          ? "Table service"
          : form.foodSelection;
  const foodRows = [
    ["Selection", foodSelectionLabel],
    ["Menu", form.foodMenu],
    ["Number of servings", form.peopleCount],
    ["Allergies", form.allergiesSummary],
    ["Other", form.foodOther],
    ["Chef", form.chefName],
    ["Chef phone", form.chefPhone],
  ];
  const spaceRows = [
    ["Setup style", form.spaceSetup],
    ["Table / decoration", form.tableStyleNotes],
  ];
  const techRows = [
    ["Soundsystem", form.soundsystemCheck],
    ["Lights and disco", form.lightsDiscoCheck],
    ["Projector", form.projectorCheck],
    ["Musician / DJ - Soundcheck?", form.musicianOrDJ],
    ["Tech notes", form.techNotes],
  ];

  if (!booking) return null;

  const eventName = form.eventNameOrCompany?.trim() || null;
  const eventType = form.eventType?.trim() || null;
  const contactParts = [form.contactName, form.contactPhone, form.contactComment].filter(Boolean);
  const extraContactLines = (form.extraContacts || [])
    .map((c) => [c?.name, c?.phone, c?.comment].filter(Boolean).join(" \u00B7 "))
    .filter(Boolean);

  return (
    <section className="space-y-4 sm:space-y-5">
      <header className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            {editingSection === "contact" ? (
              <div className="space-y-4">
                <Field label="Name of Event / Company">
                  <input
                    value={form.eventNameOrCompany}
                    onChange={(e) => form.setEventNameOrCompany(e.target.value)}
                    placeholder="Event or company name"
                    className={inputClass}
                  />
                </Field>
                <Field label="Type of event">
                  <input
                    value={form.eventType}
                    onChange={(e) => form.setEventType(e.target.value)}
                    placeholder="e.g. birthday, yearly celebration"
                    className={inputClass}
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Booking contact name">
                    <input
                      value={form.contactName}
                      onChange={(e) => form.setContactName(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Booking contact phone">
                    <input
                      value={form.contactPhone}
                      onChange={(e) => form.setContactPhone(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label="Comment">
                  <input
                    type="text"
                    value={form.contactComment}
                    onChange={(e) => form.setContactComment(e.target.value)}
                    placeholder="Optional note"
                    className={inputClass}
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
                    className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    + Add contact
                  </button>
                </div>
                {form.extraContacts.length > 0 ? (
                  <div className="space-y-3">
                    {form.extraContacts.map((c, idx) => (
                      <div key={idx} className="rounded-xl border border-gray-200 bg-white p-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            value={c?.name || ""}
                            onChange={(e) =>
                              form.setExtraContacts((prev) =>
                                prev.map((row, i) =>
                                  i === idx ? { ...(row || {}), name: e.target.value } : row
                                )
                              )
                            }
                            placeholder="Name"
                            className={inputClass}
                          />
                          <input
                            value={c?.phone || ""}
                            onChange={(e) =>
                              form.setExtraContacts((prev) =>
                                prev.map((row, i) =>
                                  i === idx ? { ...(row || {}), phone: e.target.value } : row
                                )
                              )
                            }
                            placeholder="Phone"
                            className={inputClass}
                          />
                        </div>
                        <div className="mt-2">
                          <input
                            type="text"
                            value={c?.comment || ""}
                            onChange={(e) =>
                              form.setExtraContacts((prev) =>
                                prev.map((row, i) =>
                                  i === idx ? { ...(row || {}), comment: e.target.value } : row
                                )
                              )
                            }
                            placeholder="Comment"
                            className={inputClass}
                          />
                        </div>
                        <div className="mt-2 flex justify-start">
                          <button
                            type="button"
                            onClick={() =>
                              form.setExtraContacts((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                            aria-label="Remove contact"
                          >
                            <span aria-hidden>×</span> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  {eventName || `Booking #${bookingRef}`}
                </h2>
                {eventType ? (
                  <p className="text-sm text-gray-600">{eventType}</p>
                ) : null}
                {contactParts.length > 0 ? (
                  <p className="text-sm text-gray-700">
                    {contactParts.join(" \u00B7 ")}
                  </p>
                ) : null}
                {extraContactLines.length > 0
                  ? extraContactLines.map((line, i) => (
                      <p key={i} className="text-sm text-gray-700">
                        {line}
                      </p>
                    ))
                  : null}
              </div>
            )}
          </div>
          <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
            {editingSection === "contact" ? (
              <>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSectionSave}
                  disabled={form.saving}
                  className="rounded-lg bg-[#a77d3b] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#8b6a2f] disabled:opacity-50"
                >
                  {form.saving ? "Saving…" : "Save"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditingSection("contact")}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </header>

      {form.saveError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {form.saveError}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        {/* Timing */}
        <SectionCard
          title="Timing"
          action={
            editingSection === "timing" ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSectionSave}
                  disabled={form.saving}
                  className="rounded-lg bg-[#a77d3b] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#8b6a2f] disabled:opacity-50"
                >
                  {form.saving ? "Saving…" : "Save"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingSection("timing")}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            )
          }
        >
          {editingSection === "timing" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Date">
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => form.setDate(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Start time">
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => form.setStartTime(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="End time">
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => form.setEndTime(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="End-time policy" hint="Choose one: hard cutoff, flexible, or unsure.">
                <select
                  value={form.endTimePolicy}
                  onChange={(e) => form.setEndTimePolicy(e.target.value)}
                  className={inputClass}
                >
                  <option value="unsure">Unsure</option>
                  <option value="hardCutoff">Hard cutoff (lights on / clear venue at end time)</option>
                  <option value="canStayLate">Flexible</option>
                </select>
              </Field>
              <Field label="Latest exit time (optional)" hint="Only if ‘Flexible’ is selected.">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="time"
                    value={form.latestExitTime}
                    onChange={(e) => form.setLatestExitTime(e.target.value)}
                    disabled={form.endTimePolicy !== "canStayLate"}
                    className={inputClass + " disabled:opacity-50 w-auto"}
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
            </div>
          ) : (
            <dl className="space-y-2 sm:space-y-2.5">
              {dateTimeLine ? (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3 sm:items-baseline">
                  <dt className="shrink-0 text-sm text-gray-600 sm:min-w-[10rem]">Date</dt>
                  <dd className="break-words text-sm text-gray-900">{dateTimeLine}</dd>
                </div>
              ) : null}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-x-6">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3 sm:items-baseline">
                  <dt className="shrink-0 text-sm text-gray-600 sm:min-w-[10rem]">End-time policy</dt>
                  <dd className="break-words text-sm text-gray-900">{endTimePolicyLabel}</dd>
                </div>
                {form.latestExitTime ? (
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3 sm:items-baseline">
                    <dt className="shrink-0 text-sm text-gray-600 sm:min-w-[10rem]">Latest exit time</dt>
                    <dd className="break-words text-sm text-gray-900">{form.latestExitTime}</dd>
                  </div>
                ) : null}
              </div>
            </dl>
          )}
        </SectionCard>

        {/* Guests & staffing */}
        <SectionCard
          title="Guests & staffing"
          action={
            editingSection === "guests" ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSectionSave}
                  disabled={form.saving}
                  className="rounded-lg bg-[#a77d3b] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#8b6a2f] disabled:opacity-50"
                >
                  {form.saving ? "Saving…" : "Save"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingSection("guests")}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            )
          }
        >
          {editingSection === "guests" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Guest quantity (text)">
                  <input
                    value={form.guestCount}
                    onChange={(e) => form.setGuestCount(e.target.value)}
                    placeholder="e.g. 80–90 pax"
                    className={inputClass}
                  />
                </Field>
                <Field label="How many staff are needed?">
                  <input
                    value={form.staffNeeded}
                    onChange={(e) => form.setStaffNeeded(e.target.value)}
                    placeholder="e.g. 3 (1 bar, 2 floor)"
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Comment">
                <textarea
                  value={form.guestStaffComment}
                  onChange={(e) => form.setGuestStaffComment(e.target.value)}
                  rows={3}
                  placeholder="Optional notes on guests or staffing"
                  className={inputClass}
                />
              </Field>
            </div>
          ) : (
            <dl className="space-y-2 sm:space-y-2.5">
              {guestsRows.map(([label, value]) => (
                <Row key={label} label={label} value={value} />
              ))}
            </dl>
          )}
        </SectionCard>

        {/* Drinks */}
        <SectionCard
          title="Drinks"
          action={
            editingSection === "drinks" ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSectionSave}
                  disabled={form.saving}
                  className="rounded-lg bg-[#a77d3b] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#8b6a2f] disabled:opacity-50"
                >
                  {form.saving ? "Saving…" : "Save"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingSection("drinks")}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            )
          }
        >
          {editingSection === "drinks" ? (
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.hasDrinks}
                  onChange={(e) => form.setHasDrinks(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#a77d3b] focus:ring-[#a77d3b]"
                />
                <span className="text-sm font-medium text-gray-800">There will be drinks</span>
              </label>
              {form.hasDrinks ? (
                <>
                  <Field label="What has been prepaid?">
                    <textarea
                      value={form.drinksPrepaid}
                      onChange={(e) => form.setDrinksPrepaid(e.target.value)}
                      rows={3}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="What should be available?">
                    <textarea
                      value={form.drinksAvailable}
                      onChange={(e) => form.setDrinksAvailable(e.target.value)}
                      rows={3}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Any pre-drinks plan?">
                    <textarea
                      value={form.preDrinksPlan}
                      onChange={(e) => form.setPreDrinksPlan(e.target.value)}
                      rows={2}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Will they bring something themselves?">
                    <textarea
                      value={form.bringingOwnItems}
                      onChange={(e) => form.setBringingOwnItems(e.target.value)}
                      rows={2}
                      className={inputClass}
                    />
                  </Field>
                </>
              ) : null}
            </div>
          ) : (
            <dl className="space-y-2 sm:space-y-2.5">
              {drinksRows.map(([label, value]) => (
                <Row key={label} label={label} value={value} />
              ))}
            </dl>
          )}
        </SectionCard>

        {/* Food */}
        <SectionCard
          title="Food"
          action={
            editingSection === "food" ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSectionSave}
                  disabled={form.saving}
                  className="rounded-lg bg-[#a77d3b] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#8b6a2f] disabled:opacity-50"
                >
                  {form.saving ? "Saving…" : "Save"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingSection("food")}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            )
          }
        >
          {editingSection === "food" ? (
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.hasFood}
                  onChange={(e) => form.setHasFood(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#a77d3b] focus:ring-[#a77d3b]"
                />
                <span className="text-sm font-medium text-gray-800">There will be food</span>
              </label>
              {form.hasFood ? (
                <>
                  <Field label="What did they select?">
                    <select
                      value={form.foodSelection}
                      onChange={(e) => form.setFoodSelection(e.target.value)}
                      className={inputClass}
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
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Number of servings:">
                    <input
                      type="text"
                      value={form.peopleCount}
                      onChange={(e) => form.setPeopleCount(e.target.value)}
                      placeholder="e.g. 50"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Allergies summary">
                    <textarea
                      value={form.allergiesSummary}
                      onChange={(e) => form.setAllergiesSummary(e.target.value)}
                      rows={2}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Anything else?">
                    <textarea
                      value={form.foodOther}
                      onChange={(e) => form.setFoodOther(e.target.value)}
                      rows={2}
                      className={inputClass}
                    />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Chef name (optional)">
                      <input
                        value={form.chefName}
                        onChange={(e) => form.setChefName(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Chef phone (optional)">
                      <input
                        value={form.chefPhone}
                        onChange={(e) => form.setChefPhone(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <dl className="space-y-2 sm:space-y-2.5">
              {foodRows.map(([label, value]) => (
                <Row key={label} label={label} value={value} />
              ))}
            </dl>
          )}
        </SectionCard>

        {/* Space */}
        <SectionCard
          title="Space"
          action={
            editingSection === "space" ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSectionSave}
                  disabled={form.saving}
                  className="rounded-lg bg-[#a77d3b] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#8b6a2f] disabled:opacity-50"
                >
                  {form.saving ? "Saving…" : "Save"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingSection("space")}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            )
          }
        >
          {editingSection === "space" ? (
            <div className="space-y-4">
              <Field label="Setup style">
                <textarea
                  value={form.spaceSetup}
                  onChange={(e) => form.setSpaceSetup(e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </Field>
              <Field label="Table style / decoration notes">
                <textarea
                  value={form.tableStyleNotes}
                  onChange={(e) => form.setTableStyleNotes(e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </Field>
            </div>
          ) : (
            <dl className="space-y-2 sm:space-y-2.5">
              {spaceRows.map(([label, value]) => (
                <Row key={label} label={label} value={value} />
              ))}
            </dl>
          )}
        </SectionCard>

        {/* Tech */}
        <SectionCard
          title="Tech"
          action={
            editingSection === "tech" ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSectionSave}
                  disabled={form.saving}
                  className="rounded-lg bg-[#a77d3b] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#8b6a2f] disabled:opacity-50"
                >
                  {form.saving ? "Saving…" : "Save"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingSection("tech")}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            )
          }
        >
          {editingSection === "tech" ? (
            <div className="space-y-4">
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
                  className={inputClass}
                />
              </Field>
              <Field label="Tech notes / what's needed / what's available">
                <textarea
                  value={form.techNotes}
                  onChange={(e) => form.setTechNotes(e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </Field>
            </div>
          ) : (
            <dl className="space-y-2 sm:space-y-2.5">
              {techRows.map(([label, value]) => (
                <Row key={label} label={label} value={value} />
              ))}
            </dl>
          )}
        </SectionCard>
      </div>
    </section>
  );
}
