"use client";

import { useState } from "react";
import { X } from "lucide-react";

// Textarea helpers: one item per line <-> text[]
const linesToArray = (text) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
const arrayToLines = (arr) => (arr || []).join("\n");

// Itinerary helpers: "08:30 | Depart Bankastræti 2" per line <-> jsonb
const linesToItinerary = (text) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [time, ...rest] = line.split("|");
      return { time: (time || "").trim(), title: rest.join("|").trim() };
    })
    .filter((step) => step.time && step.title);
const itineraryToLines = (arr) =>
  (Array.isArray(arr) ? arr : [])
    .map((step) => `${step.time} | ${step.title}`)
    .join("\n");

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";

export default function TourForm({ onSubmit, onClose, initialData }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    subtitle: initialData?.subtitle || "",
    description: initialData?.description || "",
    short_description: initialData?.short_description || "",
    long_description: initialData?.long_description || "",
    price: initialData?.price || "",
    duration_minutes: initialData?.duration_minutes || "",
    max_capacity: initialData?.max_capacity || "",
    image_url: initialData?.image_url || "",
    gallery: arrayToLines(initialData?.gallery),
    schedule_note: initialData?.schedule_note || "",
    meeting_point: initialData?.meeting_point || "",
    difficulty: initialData?.difficulty || "",
    min_age: initialData?.min_age || "",
    is_active: initialData ? !!initialData.is_active : true,
    highlights: arrayToLines(initialData?.highlights),
    included: arrayToLines(initialData?.included),
    what_to_bring: arrayToLines(initialData?.what_to_bring),
    important_info: arrayToLines(initialData?.important_info),
    itinerary: itineraryToLines(initialData?.itinerary),
    private_base_price: initialData?.private_base_price || "",
    private_base_guests: initialData?.private_base_guests || "",
    private_extra_guest_price: initialData?.private_extra_guest_price || "",
    private_max_guests: initialData?.private_max_guests || "",
    private_description: initialData?.private_description || "",
  });

  const set = (key) => (e) =>
    setFormData({
      ...formData,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });

  const intOrNull = (v) => (v === "" || v === null ? null : parseInt(v, 10));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      slug: formData.slug.trim() || undefined,
      subtitle: formData.subtitle || null,
      description: formData.description,
      short_description: formData.short_description || null,
      long_description: formData.long_description || null,
      price: parseInt(formData.price, 10),
      duration_minutes: parseInt(formData.duration_minutes, 10),
      max_capacity: parseInt(formData.max_capacity, 10),
      image_url: formData.image_url || null,
      gallery: linesToArray(formData.gallery),
      schedule_note: formData.schedule_note || null,
      meeting_point: formData.meeting_point || null,
      difficulty: formData.difficulty || null,
      min_age: intOrNull(formData.min_age),
      is_active: formData.is_active,
      highlights: linesToArray(formData.highlights),
      included: linesToArray(formData.included),
      what_to_bring: linesToArray(formData.what_to_bring),
      important_info: linesToArray(formData.important_info),
      itinerary: linesToItinerary(formData.itinerary),
      private_base_price: intOrNull(formData.private_base_price),
      private_base_guests: intOrNull(formData.private_base_guests),
      private_extra_guest_price: intOrNull(formData.private_extra_guest_price),
      private_max_guests: intOrNull(formData.private_max_guests),
      private_description: formData.private_description || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {initialData ? "Edit Tour" : "Create New Tour"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tour Name">
              <input
                type="text"
                required
                value={formData.name}
                onChange={set("name")}
                className={inputCls}
              />
            </Field>
            <Field label="Slug" hint="URL path, e.g. reykjadalur (auto if empty)">
              <input
                type="text"
                value={formData.slug}
                onChange={set("slug")}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Subtitle" hint="Shown under the name on cards + hero">
            <input
              type="text"
              value={formData.subtitle}
              onChange={set("subtitle")}
              className={inputCls}
            />
          </Field>

          <Field label="One-line description" hint="Hero tagline">
            <textarea
              rows={2}
              value={formData.description}
              onChange={set("description")}
              className={inputCls}
            />
          </Field>

          <Field label="Short description" hint="Card text + SEO description">
            <textarea
              rows={2}
              value={formData.short_description}
              onChange={set("short_description")}
              className={inputCls}
            />
          </Field>

          <Field
            label="Long description"
            hint="Full story on the tour page. Blank line = new paragraph."
          >
            <textarea
              rows={6}
              value={formData.long_description}
              onChange={set("long_description")}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Price (ISK)">
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={set("price")}
                className={inputCls}
              />
            </Field>
            <Field label="Duration (min)">
              <input
                type="number"
                required
                min="1"
                value={formData.duration_minutes}
                onChange={set("duration_minutes")}
                className={inputCls}
              />
            </Field>
            <Field label="Max Capacity">
              <input
                type="number"
                required
                min="1"
                value={formData.max_capacity}
                onChange={set("max_capacity")}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Schedule note" hint='e.g. "Every Wednesday · 08:30–15:00"'>
              <input
                type="text"
                value={formData.schedule_note}
                onChange={set("schedule_note")}
                className={inputCls}
              />
            </Field>
            <Field label="Minimum age">
              <input
                type="number"
                min="0"
                value={formData.min_age}
                onChange={set("min_age")}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Image URL" hint="Cloudinary URL for hero/card image">
            <input
              type="text"
              value={formData.image_url}
              onChange={set("image_url")}
              className={inputCls}
            />
          </Field>

          <Field label="Gallery images" hint="One Cloudinary URL per line — shown as a mosaic on the tour page">
            <textarea
              rows={4}
              value={formData.gallery}
              onChange={set("gallery")}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Meeting point" hint="Line 1 = place, line 2 = address">
              <textarea
                rows={2}
                value={formData.meeting_point}
                onChange={set("meeting_point")}
                className={inputCls}
              />
            </Field>
            <Field label="Difficulty" hint='e.g. "Moderate — 7 km return"'>
              <textarea
                rows={2}
                value={formData.difficulty}
                onChange={set("difficulty")}
                className={inputCls}
              />
            </Field>
          </div>

          <Field
            label="Itinerary"
            hint='One step per line: "08:30 | Depart Bankastræti 2"'
          >
            <textarea
              rows={5}
              value={formData.itinerary}
              onChange={set("itinerary")}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Highlights" hint="One per line">
              <textarea
                rows={4}
                value={formData.highlights}
                onChange={set("highlights")}
                className={inputCls}
              />
            </Field>
            <Field label="Included" hint="One per line">
              <textarea
                rows={4}
                value={formData.included}
                onChange={set("included")}
                className={inputCls}
              />
            </Field>
            <Field label="What to bring" hint="One per line">
              <textarea
                rows={4}
                value={formData.what_to_bring}
                onChange={set("what_to_bring")}
                className={inputCls}
              />
            </Field>
            <Field label="Weather / safety / good to know" hint="One per line">
              <textarea
                rows={4}
                value={formData.important_info}
                onChange={set("important_info")}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Private tour (leave base price empty to hide the section)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Base price (ISK)">
                <input
                  type="number"
                  min="0"
                  value={formData.private_base_price}
                  onChange={set("private_base_price")}
                  className={inputCls}
                />
              </Field>
              <Field label="Guests included in base">
                <input
                  type="number"
                  min="1"
                  value={formData.private_base_guests}
                  onChange={set("private_base_guests")}
                  className={inputCls}
                />
              </Field>
              <Field label="Extra guest price (ISK)">
                <input
                  type="number"
                  min="0"
                  value={formData.private_extra_guest_price}
                  onChange={set("private_extra_guest_price")}
                  className={inputCls}
                />
              </Field>
              <Field label="Max private guests">
                <input
                  type="number"
                  min="1"
                  value={formData.private_max_guests}
                  onChange={set("private_max_guests")}
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Private tour description">
                <textarea
                  rows={3}
                  value={formData.private_description}
                  onChange={set("private_description")}
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={set("is_active")}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Active (visible and bookable on the website)
          </label>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {initialData ? "Update Tour" : "Create Tour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
