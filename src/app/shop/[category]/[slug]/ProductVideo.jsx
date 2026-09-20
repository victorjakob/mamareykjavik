"use client";

/**
 * ProductVideo
 * ------------
 * Optional per-product video, rendered under the gallery on the product page.
 *
 * A product carries a list of video URLs. Each entry is either:
 *   • a YouTube / Vimeo link (watch, youtu.be, shorts, vimeo.com/123)
 *   • a direct file URL (an .mp4/.webm/.mov uploaded to the Store bucket)
 *
 * Nothing loads until the visitor clicks: YouTube and Vimeo only get an
 * iframe after the click, so the embed never costs us page weight or drops
 * third-party cookies on people who don't watch. Uploaded files use a native
 * <video> with preload="metadata" so only the header is fetched up front.
 */

import { useState } from "react";

const YT_PATTERNS = [
  /(?:youtube\.com|youtube-nocookie\.com)\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{6,})/i,
  /youtu\.be\/([A-Za-z0-9_-]{6,})/i,
  /(?:youtube\.com|youtube-nocookie\.com)\/shorts\/([A-Za-z0-9_-]{6,})/i,
  /(?:youtube\.com|youtube-nocookie\.com)\/embed\/([A-Za-z0-9_-]{6,})/i,
];

// A phone clip is portrait and would otherwise run most of the page height,
// so the player is shaped to the clip and capped at this many pixels tall.
const MAX_PLAYER_HEIGHT = 420;

const VIMEO_PATTERNS = [
  /vimeo\.com\/(?:video\/)?(\d{6,})/i,
  /player\.vimeo\.com\/video\/(\d{6,})/i,
];

/**
 * Work out what kind of video we were handed. Returns null for anything we
 * can't make sense of, so a typo in the admin field renders nothing rather
 * than a broken frame.
 */
export function parseVideoUrl(raw) {
  const url = typeof raw === "string" ? raw.trim() : "";
  if (!url) return null;

  for (const pattern of YT_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return {
        kind: "youtube",
        id: match[1],
        embed: `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
        poster: `https://i.ytimg.com/vi/${match[1]}/maxresdefault.jpg`,
      };
    }
  }

  for (const pattern of VIMEO_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return {
        kind: "vimeo",
        id: match[1],
        embed: `https://player.vimeo.com/video/${match[1]}?autoplay=1&dnt=1&title=0&byline=0&portrait=0`,
        poster: null,
      };
    }
  }

  if (/^https?:\/\//i.test(url)) {
    // A QuickTime .mov decodes in Safari and nowhere else, and Chrome doesn't
    // even raise an error — it just downloads forever behind a spinner. Mark
    // it unplayable so the page shows nothing instead of a dead black box.
    return {
      kind: "file",
      src: url,
      poster: null,
      playable: !/\.mov(\?|#|$)/i.test(url),
    };
  }

  return null;
}

function PlayGlyph({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M9 7.5v9l7.5-4.5L9 7.5z" />
    </svg>
  );
}

export default function ProductVideo({
  url,
  poster,
  label = "Watch",
  title = "Product video",
}) {
  const [playing, setPlaying] = useState(false);
  // A format the browser can't decode (a .mov outside Safari, say) fires an
  // error on the element. We drop the player entirely rather than leave a dead
  // black rectangle sitting under the gallery.
  const [unplayable, setUnplayable] = useState(false);
  // Width/height of an uploaded clip, read off the file once its metadata
  // arrives, so the frame matches the video instead of guessing.
  const [fileRatio, setFileRatio] = useState(null);
  const video = parseVideoUrl(url);

  if (!video) return null;

  // The product's own image is the fallback poster for Vimeo and for uploaded
  // files, which don't hand us a thumbnail of their own.
  const posterSrc = video.poster || poster || null;

  // Uploaded file: hand it straight to the browser's own player. No poster —
  // the product photo as a poster just reads as the gallery image repeated.
  // The "#t=0.1" fragment nudges the browser to decode and paint a real frame
  // of the clip as its own thumbnail instead of leaving a black rectangle.
  if (video.kind === "file") {
    if (!video.playable || unplayable) return null;
    const ratio = fileRatio || 16 / 9;
    return (
      <figure>
        <div
          className="relative overflow-hidden rounded-2xl bg-[#1a1410]"
          style={{
            aspectRatio: String(ratio),
            width: "100%",
            maxWidth: `${Math.round(MAX_PLAYER_HEIGHT * ratio)}px`,
          }}
        >
          <video
            src={`${video.src}#t=0.1`}
            controls
            playsInline
            preload="metadata"
            title={title}
            onLoadedMetadata={(event) => {
              const { videoWidth, videoHeight } = event.currentTarget;
              if (videoWidth && videoHeight) {
                setFileRatio(videoWidth / videoHeight);
              }
            }}
            onError={() => setUnplayable(true)}
            className="absolute inset-0 h-full w-full bg-[#1a1410] object-contain"
          />
        </div>
      </figure>
    );
  }

  // YouTube / Vimeo: poster first, iframe only once they ask for it.
  return (
    <figure>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#1a1410]">
        {playing ? (
          <iframe
            src={video.embed}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`${label} — ${title}`}
            className="group absolute inset-0 h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff914d]/50"
          >
            {posterSrc ? (
              // Plain <img>: YouTube thumbnails live on a host we don't want
              // to add to the Next image allowlist just for this.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={posterSrc}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-85 transition-opacity duration-500 group-hover:opacity-100"
              />
            ) : null}

            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#1a1410]/75 via-[#1a1410]/15 to-transparent"
            />

            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f7f1e7] text-[#1a1410] shadow-[0_6px_30px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-105">
                <PlayGlyph className="ml-[3px] h-8 w-8" />
              </span>
            </span>

            <span className="absolute bottom-4 left-5 flex items-center gap-3">
              <span className="h-px w-6 bg-[#ff914d]/70" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#f0ebe3]">
                {label}
              </span>
            </span>
          </button>
        )}
      </div>
    </figure>
  );
}
