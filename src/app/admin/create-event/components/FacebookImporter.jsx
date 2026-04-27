"use client";

import { useState } from "react";

// Top-of-form importer with two modes:
//  - URL mode: paste a public FB event URL → server scrapes Open Graph + JSON-LD.
//  - Paste mode: paste copied event text → server runs OpenAI extraction.
//
// Collapsed by default. The host clicks the small trigger to expand the
// full panel. Both endpoints return the same `extracted` shape, so the
// parent's onImport(extracted) handler is identical.

export default function FacebookImporter({ onImport }) {
  const [expanded, setExpanded] = useState(false);
  const [url, setUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [showPaste, setShowPaste] = useState(false);

  const runImport = async (endpoint, body, scrapeFailed = false) => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({
          type: "error",
          message: data.message || "Import failed.",
        });
        // Auto-open the paste fallback panel when the URL scrape fails.
        if (scrapeFailed) setShowPaste(true);
        return;
      }

      const filled = await onImport(data.extracted || {});
      const warns = data.warnings || {};
      const missing = [];
      if (warns.missing_date) missing.push("date");
      if (warns.missing_description) missing.push("description");
      if (warns.missing_image) missing.push("image");
      if (warns.image_download_failed && !warns.missing_image)
        missing.push("image (couldn't download)");

      const filledCount = Array.isArray(filled) ? filled.length : 0;
      const filledMsg = filledCount
        ? `Imported ${filledCount} field${filledCount === 1 ? "" : "s"}.`
        : "Nothing could be imported.";
      const missingMsg = missing.length
        ? ` Missing: ${missing.join(", ")} — please fill manually.`
        : "";

      setStatus({
        type: filledCount ? "ok" : "error",
        message: `${filledMsg}${missingMsg}`,
      });
    } catch (e) {
      setStatus({
        type: "error",
        message: e?.message || "Something went wrong.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleUrlImport = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setStatus({
        type: "error",
        message: "Paste a Facebook event URL first.",
      });
      return;
    }
    runImport("/api/events/import-from-fb", { url: trimmed }, true);
  };

  const handleTextImport = () => {
    const trimmed = pastedText.trim();
    if (trimmed.length < 30) {
      setStatus({
        type: "error",
        message: "Paste more event text — at least the title and description.",
      });
      return;
    }
    runImport("/api/events/import-from-text", { text: trimmed });
  };

  // ── Collapsed pill ───────────────────────────────────────────────────────
  if (!expanded) {
    return (
      <div className="mb-4 sm:mb-5">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          style={{
            background: "#ffffff",
            color: "#4338ca",
            border: "1px solid #e0e7ff",
          }}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ color: "#1877f2" }}
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Import from Facebook
          <span aria-hidden="true">›</span>
        </button>
      </div>
    );
  }

  // ── Expanded panel ───────────────────────────────────────────────────────
  return (
    <div
      className="rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6"
      style={{
        background: "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)",
        border: "1px solid #e0e7ff",
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ color: "#1877f2" }}
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="text-sm font-semibold" style={{ color: "#1e1b4b" }}>
            Import from Facebook
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs font-medium px-2 py-1 rounded-md transition-colors"
          style={{ color: "#6366f1" }}
          aria-label="Hide importer"
        >
          Hide
        </button>
      </div>

      {/* URL row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.facebook.com/events/..."
          disabled={busy}
          className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-60"
          style={{
            background: "#ffffff",
            color: "#1e1b4b",
            border: "1px solid #c7d2fe",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleUrlImport();
            }
          }}
        />
        <button
          type="button"
          onClick={handleUrlImport}
          disabled={busy}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
          style={{ background: "#4338ca" }}
        >
          {busy ? (
            <>
              <svg
                className="w-4 h-4 mr-1.5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Working…
            </>
          ) : (
            "Import"
          )}
        </button>
      </div>

      {status && (
        <p
          className="mt-2 text-xs"
          style={{
            color: status.type === "error" ? "#b91c1c" : "#047857",
          }}
        >
          {status.message}
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowPaste((v) => !v)}
        className="mt-2 text-xs underline underline-offset-2"
        style={{ color: "#6366f1" }}
      >
        {showPaste
          ? "Hide paste fallback"
          : "FB blocking the URL? Paste the event details instead →"}
      </button>

      {showPaste && (
        <div
          className="mt-2 rounded-lg p-3"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px dashed #c7d2fe",
          }}
        >
          <p className="text-xs mb-2" style={{ color: "#4338ca" }}>
            Open the event on Facebook, copy the title + description + date,
            paste here.
          </p>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste the event content from Facebook here…"
            rows={6}
            disabled={busy}
            className="w-full px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 disabled:opacity-60"
            style={{
              background: "#ffffff",
              color: "#1e1b4b",
              border: "1px solid #c7d2fe",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleTextImport}
              disabled={busy}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: "#7c3aed" }}
            >
              {busy ? "Extracting…" : "Extract from text"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
