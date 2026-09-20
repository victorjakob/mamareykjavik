# Vendored ffmpeg.wasm wrapper

These are the unmodified ESM builds of:

  @ffmpeg/ffmpeg 0.12.15  -> ffmpeg/
  @ffmpeg/util   0.12.2   -> util/

Both MIT licensed (see LICENSE).

They are served from /vendor/ffmpeg/... rather than installed as npm
dependencies for one reason: @ffmpeg/ffmpeg starts a module Worker with
`new Worker(new URL("./worker.js", import.meta.url))`. That worker has to be
same-origin as its sibling modules, so loading the package straight from a CDN
does not work — the worker starts and then dies silently when its relative
imports fail. Serving the files from our own /public solves that without a
build step.

The heavy part (ffmpeg-core.js + ffmpeg-core.wasm, ~32MB) is NOT vendored — it
is fetched from the CDN on first use and cached by the browser. See
src/app/admin/manage-store/products/ProductExtrasConvert.js.

To update: download the two tarballs from registry.npmjs.org, and copy
dist/esm/* from each into the folders above.
