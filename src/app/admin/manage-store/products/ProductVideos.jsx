"use client";

/**
 * ProductVideos
 * -------------
 * The videos shown under the gallery on a product page, in order. Each entry
 * is either a YouTube/Vimeo link or a file uploaded to the Store bucket.
 *
 * Uploads don't go through our API: a video is tens of megabytes and would
 * blow past the serverless request body limit, so we mint a one-shot signed
 * URL and the browser sends the file straight to storage. A .mov is converted
 * to MP4 first — see ProductExtrasConvert.js.
 *
 * Like ProductDetails, the list is local state kept in sync with the form,
 * because setValue() alone doesn't reliably re-render a watcher for a name
 * that was never attached to an input.
 */

import { useRef, useState } from "react";
import { ClipLoader } from "react-spinners";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/util/supabase/client";
import { parseVideoUrl } from "@/app/shop/[category]/[slug]/ProductVideo";
import {
  convertToMp4,
  needsConversion,
  MAX_CONVERTIBLE_BYTES,
} from "./ProductExtrasConvert";

const ACCEPT = "video/mp4,video/webm,video/quicktime";
const MAX_BYTES = 200 * 1024 * 1024;
const MAX_VIDEOS = 6;

function describe(url) {
  const video = parseVideoUrl(url);
  if (!video)
    return { ok: false, text: "Not a video link — the page will skip this." };
  if (video.kind === "youtube") return { ok: true, text: "YouTube" };
  if (video.kind === "vimeo") return { ok: true, text: "Vimeo" };
  if (video.playable === false)
    return {
      ok: false,
      text: "A .mov — only plays in Safari, so the page hides it. Remove it and upload the file again to have it converted.",
    };
  return { ok: true, text: "Uploaded file" };
}

export default function ProductVideos({
  register,
  setValue,
  initialVideos,
  disabled,
}) {
  const fileInputRef = useRef(null);
  const [videos, setVideos] = useState(() =>
    Array.isArray(initialVideos) ? initialVideos : []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [converting, setConverting] = useState(null);
  const [linkDraft, setLinkDraft] = useState("");

  // Keep the name in the form's values even before anything is added.
  register("videos");

  const write = (next) => {
    const capped = next.slice(0, MAX_VIDEOS);
    setVideos(capped);
    setValue("videos", capped, { shouldDirty: true });
  };

  const removeVideo = (index) => write(videos.filter((_, i) => i !== index));

  const moveVideo = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= videos.length) return;
    const next = [...videos];
    [next[index], next[target]] = [next[target], next[index]];
    write(next);
  };

  const addLink = () => {
    const url = linkDraft.trim();
    if (!url) return;
    if (!parseVideoUrl(url)) {
      setUploadError(
        "That doesn't look like a video link. Paste a full YouTube or Vimeo URL."
      );
      return;
    }
    write([...videos, url]);
    setLinkDraft("");
    setUploadError(null);
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (file.size > MAX_BYTES) {
      setUploadError(
        "That file is over 200MB. Put it on YouTube or Vimeo and paste the link instead."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      // A .mov can't play outside Safari, so it's rewrapped as MP4 here in
      // the browser before anything leaves the machine.
      let upload = file;
      if (needsConversion(file)) {
        if (file.size > MAX_CONVERTIBLE_BYTES) {
          throw new Error(
            "That .mov is too big to convert here. Put it on YouTube and paste the link instead."
          );
        }
        setConverting({ stage: "Starting up…", progress: null });
        try {
          upload = await convertToMp4(file, setConverting);
        } catch (error) {
          console.error("Video conversion failed:", error);
          throw new Error(error.message || "Couldn't convert that .mov.");
        } finally {
          setConverting(null);
        }
      }

      // 1. Ask our API for a signed upload URL (admin-only).
      const response = await fetch("/api/store/video-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: upload.name,
          contentType: upload.type,
        }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "Could not start upload");

      // 2. Send the file browser → storage, never through our server.
      const { error } = await supabase.storage
        .from(payload.bucket)
        .uploadToSignedUrl(payload.path, payload.token, upload, {
          contentType: upload.type,
        });
      if (error) throw error;

      write([...videos, payload.publicUrl]);
    } catch (error) {
      console.error("Video upload failed:", error);
      setUploadError(error.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <section className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-6 border-b border-slate-200/50">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <span className="text-amber-600 text-sm font-bold">🎬</span>
          </div>
          Product Videos
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          Optional. Shown under the gallery, in this order.
        </p>
      </div>

      <div className="p-4 sm:p-8 space-y-4">
        {videos.length > 0 && (
          <div className="space-y-2">
            {videos.map((url, index) => {
              const info = describe(url);
              return (
                <div
                  key={`${url}-${index}`}
                  className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        info.ok ? "text-emerald-700" : "text-[#c05a1a]"
                      }`}
                    >
                      {info.ok ? "✓" : "⚠️"} {info.text}
                    </p>
                    <p className="truncate text-xs text-slate-500">{url}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveVideo(index, -1)}
                      disabled={disabled || uploading || index === 0}
                      aria-label="Move up"
                      className="h-9 w-9 rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-slate-800 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveVideo(index, 1)}
                      disabled={
                        disabled || uploading || index === videos.length - 1
                      }
                      aria-label="Move down"
                      className="h-9 w-9 rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-slate-800 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      disabled={disabled || uploading}
                      aria-label="Remove video"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-[#c05a1a]"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {videos.length < MAX_VIDEOS && (
          <div className="space-y-3 rounded-xl border border-dashed border-slate-300 p-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="url"
                inputMode="url"
                value={linkDraft}
                onChange={(event) => setLinkDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addLink();
                  }
                }}
                disabled={disabled || uploading}
                placeholder="Paste a YouTube or Vimeo link"
                className="w-full flex-1 rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:bg-slate-50"
              />
              <button
                type="button"
                onClick={addLink}
                disabled={disabled || uploading || !linkDraft.trim()}
                className="rounded-xl bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-500">or upload a file</span>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                onChange={handleFile}
                disabled={disabled || uploading}
                className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-amber-50 file:px-5 file:py-2 file:text-sm file:font-semibold file:text-amber-700 hover:file:bg-amber-100 focus:outline-none sm:w-auto"
              />
              {uploading && (
                <span className="flex items-center gap-2 text-sm font-medium text-amber-600">
                  <ClipLoader color="#d97706" size={16} />
                  {converting ? converting.stage : "Uploading video…"}
                  {converting?.progress != null && (
                    <span className="tabular-nums">
                      {Math.round(converting.progress * 100)}%
                    </span>
                  )}
                </span>
              )}
            </div>

            {uploadError && (
              <p className="flex items-start gap-1 text-sm text-[#c05a1a]">
                <span>⚠️</span> {uploadError}
              </p>
            )}

            <p className="text-xs text-slate-500">
              Up to 200MB each. Anything longer or heavier belongs on YouTube —
              paste the link and the page only loads it when someone presses
              play.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
