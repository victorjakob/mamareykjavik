"use client";

/**
 * Turn a video the browser can't play into one it can, in the admin, before
 * anything is uploaded.
 *
 * The case this exists for: phones and QuickTime hand you a .mov. Safari plays
 * it, Chrome, Firefox and Android don't — and Chrome doesn't even error, it
 * just downloads forever behind a spinner. Uploading one puts an invisible
 * video on the product page.
 *
 * Almost every .mov is already H.264 video and AAC audio in a QuickTime
 * wrapper, so the first attempt is a remux: keep the streams exactly as they
 * are and rewrite the container as MP4. That's a copy, not an encode — a few
 * seconds, no quality lost. Only if that fails do we re-encode properly, which
 * is slower but handles anything.
 *
 * This all runs in the visitor's own browser (ffmpeg compiled to WebAssembly),
 * so nothing is uploaded until it has finished and no server does the work.
 * The engine is ~32MB and is fetched on first use only, then browser-cached.
 */

const CORE_VERSION = "0.12.10";
// The ESM core, because the wrapper runs a *module* worker: the UMD core is
// pulled in with importScripts(), which doesn't exist in a module worker, and
// loading fails with "failed to import ffmpeg-core.js".
const CORE_BASE = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

// The wrapper itself is served from our own /public rather than a CDN or an
// npm dependency: it starts its worker with
//   new Worker(new URL("./worker.js", import.meta.url))
// so the worker has to sit same-origin next to its sibling modules. Loaded
// from a CDN the worker starts and then dies silently when its relative
// imports are blocked. See public/vendor/ffmpeg/README.md.
const WRAPPER_BASE = "/vendor/ffmpeg";

// Above this the browser tab risks running out of memory mid-convert.
export const MAX_CONVERTIBLE_BYTES = 150 * 1024 * 1024;

export function needsConversion(file) {
  if (!file) return false;
  return /\.mov$/i.test(file.name) || file.type === "video/quicktime";
}

/**
 * A fresh engine per conversion. ffmpeg exits the wasm process once it has
 * finished muxing ("Aborted()" in the log, after a successful run), so reusing
 * one instance for a second file is asking for trouble. The 32MB core is
 * browser-cached after the first fetch, so a reload costs a few seconds.
 */
async function createEngine(onStage) {
  // Imported at runtime, from /public: nothing here is in the admin bundle
  // until someone actually picks a file that needs converting, and the
  // bundler never tries to resolve these paths.
  const [{ FFmpeg }, { toBlobURL, fetchFile }] = await Promise.all([
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ `${WRAPPER_BASE}/ffmpeg/index.js`),
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ `${WRAPPER_BASE}/util/index.js`),
  ]);

  onStage?.("Fetching the video engine (first time only)…");

  const ffmpeg = new FFmpeg();
  await ffmpeg.load({
    coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
  });

  return { ffmpeg, fetchFile };
}

/**
 * @param {File} file
 * @param {(state: {stage: string, progress: number|null}) => void} [onUpdate]
 * @returns {Promise<File>} the same footage as a browser-playable .mp4
 */
export async function convertToMp4(file, onUpdate) {
  if (file.size > MAX_CONVERTIBLE_BYTES) {
    throw new Error(
      "That file is too big to convert here. Export it as MP4 first, or put it on YouTube and paste the link."
    );
  }

  const report = (stage, progress = null) => onUpdate?.({ stage, progress });

  const { ffmpeg, fetchFile } = await createEngine((stage) => report(stage));

  const input = "input.mov";
  const output = "output.mp4";

  const onProgress = ({ progress }) => {
    if (typeof progress === "number" && progress > 0 && progress <= 1) {
      report("Converting to MP4…", progress);
    }
  };
  ffmpeg.on("progress", onProgress);

  try {
    report("Reading the file…");
    await ffmpeg.writeFile(input, await fetchFile(file));

    // Pass 1 — rewrap the existing streams. Fast, lossless, works for the
    // H.264/AAC .mov files phones and QuickTime produce.
    report("Converting to MP4…");
    let ok = false;
    try {
      await ffmpeg.exec([
        "-i", input,
        "-c", "copy",
        "-movflags", "+faststart",
        output,
      ]);
      const probe = await ffmpeg.readFile(output);
      ok = probe && probe.length > 1024;
    } catch {
      ok = false;
    }

    // Pass 2 — the streams themselves aren't web-playable (ProRes, say), so
    // re-encode. Capped at 1280px wide to keep a product clip a sane size.
    if (!ok) {
      report("Re-encoding (this one needs a bit longer)…");
      await ffmpeg.exec([
        "-i", input,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "24",
        "-vf", "scale='min(1280,iw)':-2",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        "-y", output,
      ]);
    }

    const data = await ffmpeg.readFile(output);
    if (!data || data.length < 1024) {
      throw new Error("The converted file came out empty.");
    }

    report("Finishing up…", 1);

    const name = file.name.replace(/\.[^.]+$/, "") + ".mp4";
    return new File([data.buffer ?? data], name, { type: "video/mp4" });
  } finally {
    ffmpeg.off?.("progress", onProgress);
    // Drop the wasm instance and its heap — these files are tens of megabytes.
    try {
      ffmpeg.terminate();
    } catch {
      // Already gone; ffmpeg exits the process itself once it has muxed.
    }
  }
}
