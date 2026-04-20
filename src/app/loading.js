// Root-level loading state. Shown automatically by the App Router while
// any route segment's server component is still fetching data (streaming
// SSR). Replaces the default blank page with a warm, branded placeholder
// so the user never stares at a white screen.
//
// Kept intentionally minimal — no client hooks, no framer-motion — so it
// ships in the root layout bundle and paints instantly.

export default function RootLoading() {
  return (
    <div
      data-navbar-theme="dark"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0f08] via-[#2c1810] to-[#5c2e12]"
    >
      <div className="flex flex-col items-center gap-4" aria-live="polite">
        <span
          className="inline-block h-10 w-10 rounded-full border-2 border-[#ff914d]/30 border-t-[#ff914d] animate-spin"
          aria-hidden="true"
        />
        <p className="text-[#fff6ea]/80 text-sm tracking-[0.28em] uppercase">
          A moment, please
        </p>
      </div>
    </div>
  );
}
