"use client";

// Shared form for /new and /[id]/edit. Pure client component — the page
// passes initial values (empty object for new) and the form POSTs or PATCHes.

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { slugify } from "@/app/private-session/_lib/admin-validation";

function FieldLabel({ children, hint }) {
  return (
    <div className="mb-2">
      <label className="block text-[10px] uppercase tracking-[0.25em] text-[#a09488]">
        {children}
      </label>
      {hint && <p className="text-[10px] text-[#7a6d5e] mt-0.5">{hint}</p>}
    </div>
  );
}

const FIELD_INPUT =
  "w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-[#f0ebe3] focus:border-[#ff914d] outline-none";

// ── Photo upload ─────────────────────────────────────────────────────────────
// Drag-or-pick file upload + thumbnail preview. URL paste fallback is hidden
// behind a small toggle for power users (legacy Cloudinary URLs etc).
function PhotoUpload({ value, slug, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [showUrl, setShowUrl] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErr("Image is over 10 MB — please pick a smaller one.");
      return;
    }
    if (!/^image\//.test(file.type)) {
      setErr("Please pick an image file.");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (slug) fd.append("slug", slug);
      const res = await fetch("/api/private-session/admin/upload-photo", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      onChange(data.url);
    } catch (e) {
      setErr(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <FieldLabel hint="Square or portrait works best. JPG, PNG, WebP, or AVIF up to 10 MB.">
        Portrait
      </FieldLabel>

      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-[#160f0a] border border-white/[0.08] flex-shrink-0">
          {value ? (
            <Image
              src={value}
              alt="Practitioner portrait"
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#7a6d5e] text-xs uppercase tracking-[0.2em]">
              No photo
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="px-4 py-2 rounded-full bg-[#ff914d] text-[#160f0a] text-[10px] tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? "Uploading…" : value ? "Replace photo" : "Upload photo"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={busy}
                className="px-4 py-2 rounded-full border border-white/15 text-[#d8cfc1] text-[10px] tracking-[0.25em] uppercase hover:bg-white/[0.05] transition disabled:opacity-50"
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowUrl((s) => !s)}
              className="px-4 py-2 rounded-full text-[10px] tracking-[0.25em] uppercase text-[#7a6d5e] hover:text-[#d8cfc1] transition"
            >
              {showUrl ? "Hide URL" : "Paste URL"}
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleFile(file);
              // Reset so picking the same file twice still fires.
              e.target.value = "";
            }}
          />

          {showUrl && (
            <input
              type="url"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://…"
              className={`${FIELD_INPUT} text-xs font-mono`}
            />
          )}

          {err && <div className="text-red-300 text-xs">{err}</div>}
        </div>
      </div>
    </div>
  );
}

export default function PractitionerForm({ mode = "create", initial = {}, practitionerId = null }) {
  const router = useRouter();
  // Slug is no longer user-editable: on create it's derived from the name on
  // the server (with random-digit suffix fallback if taken). On edit we keep
  // the existing slug stable so the public URL doesn't break, so we just
  // never send it from this form.
  const [v, setV] = useState({
    name: initial.name || "",
    country_of_origin: initial.country_of_origin || "",
    bio_md: initial.bio_md || "",
    photo_url: initial.photo_url || "",
    residency_start: initial.residency_start || "",
    residency_end: initial.residency_end || "",
    is_active: initial.is_active ?? true,
    display_order: initial.display_order ?? 0,
    notification_email: initial.notification_email || "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // For PhotoUpload's filename hint only — uses the existing slug on edit, or
  // a slugified name on create. The server still owns final slug resolution.
  const photoSlug = initial.slug || slugify(v.name) || "";

  function update(k, val) {
    setV((prev) => ({ ...prev, [k]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!v.name.trim()) {
      setError("Name is required.");
      return;
    }
    setBusy(true);
    try {
      const url =
        mode === "create"
          ? "/api/private-session/admin/practitioners"
          : `/api/private-session/admin/practitioners/${practitionerId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...v,
          // Empty-date inputs come in as "" — pass null so Postgres takes it as NULL.
          residency_start: v.residency_start || null,
          residency_end: v.residency_end || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      router.push("/private-session/admin/practitioners");
      router.refresh();
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive() {
    if (!practitionerId) return;
    if (!window.confirm("Archive this practitioner? They stop appearing publicly. You can re-activate them by editing the row.")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/private-session/admin/practitioners/${practitionerId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.push("/private-session/admin/practitioners");
      router.refresh();
    } catch (e) {
      setError(e.message || "Archive failed");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Identity */}
      <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-5">
        <h3 className="font-cormorant text-xl md:text-2xl italic text-[#f0ebe3] pb-3 border-b border-white/[0.06] text-center">
          Identity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <FieldLabel>Name</FieldLabel>
            <input
              type="text"
              required
              value={v.name}
              onChange={(e) => update("name", e.target.value)}
              className={FIELD_INPUT}
            />
          </div>
          <div>
            <FieldLabel>Country of origin</FieldLabel>
            <input
              type="text"
              value={v.country_of_origin}
              onChange={(e) => update("country_of_origin", e.target.value)}
              placeholder="Guatemala"
              className={FIELD_INPUT}
            />
          </div>
        </div>

        <PhotoUpload
          value={v.photo_url}
          slug={photoSlug}
          onChange={(url) => update("photo_url", url)}
        />

        <div>
          <FieldLabel hint="Markdown. Paragraphs separated by a blank line. **bold** / *italic* / [links](https://…) / lists supported.">
            Bio
          </FieldLabel>
          <textarea
            rows={10}
            value={v.bio_md}
            onChange={(e) => update("bio_md", e.target.value)}
            className={`${FIELD_INPUT} resize-y font-mono text-sm leading-relaxed`}
          />
        </div>
      </div>

      {/* Stay length + ordering */}
      <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-5">
        <h3 className="font-cormorant text-xl md:text-2xl italic text-[#f0ebe3] pb-3 border-b border-white/[0.06] text-center">
          Stay length
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <FieldLabel>Start</FieldLabel>
            <input
              type="date"
              value={v.residency_start || ""}
              onChange={(e) => update("residency_start", e.target.value)}
              className={FIELD_INPUT}
            />
          </div>
          <div>
            <FieldLabel>End</FieldLabel>
            <input
              type="date"
              value={v.residency_end || ""}
              onChange={(e) => update("residency_end", e.target.value)}
              className={FIELD_INPUT}
            />
          </div>
          <div>
            <FieldLabel hint="Lower numbers appear first on the index page.">Display order</FieldLabel>
            <input
              type="number"
              value={v.display_order}
              onChange={(e) => update("display_order", parseInt(e.target.value, 10) || 0)}
              className={FIELD_INPUT}
            />
          </div>
        </div>

        <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10 cursor-pointer">
          <input
            type="checkbox"
            checked={v.is_active}
            onChange={(e) => update("is_active", e.target.checked)}
            className="mt-1 accent-[#ff914d]"
          />
          <span>
            <span className="block text-sm text-[#f0ebe3]">Active</span>
            <span className="block text-xs text-[#a09488] mt-0.5">
              The practitioner shows on /private-session and their slug becomes bookable. Uncheck to take them down without deleting.
            </span>
          </span>
        </label>
      </div>

      {/* Notifications */}
      <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-5">
        <h3 className="font-cormorant text-xl md:text-2xl italic text-[#f0ebe3] pb-3 border-b border-white/[0.06] text-center">
          Notifications
        </h3>
        <div>
          <FieldLabel hint="Extra email to notify on every booking and waitlist signup. Sent in addition to the Mama and White Lotus team addresses. Leave blank if not needed.">
            Notification email
          </FieldLabel>
          <input
            type="email"
            value={v.notification_email}
            onChange={(e) => update("notification_email", e.target.value)}
            placeholder="practitioner@example.com"
            className={FIELD_INPUT}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center justify-center pt-2">
        <button
          type="submit"
          disabled={busy}
          className="px-6 py-3 rounded-full bg-[#ff914d] text-[#160f0a] text-xs tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition disabled:opacity-50"
        >
          {busy ? "Saving…" : mode === "create" ? "Create practitioner" : "Save changes"}
        </button>
        {mode === "edit" && practitionerId && (
          <button
            type="button"
            onClick={handleArchive}
            disabled={busy}
            className="px-5 py-3 rounded-full border border-red-500/30 text-red-200 text-xs tracking-[0.25em] uppercase hover:bg-red-500/10 transition disabled:opacity-50"
          >
            Archive
          </button>
        )}
      </div>
    </form>
  );
}
