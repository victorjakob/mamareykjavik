-- Weekly letter: editable masthead lines.
--
-- The kicker ("THIS WEEK") and the big serif line under it used to be
-- hardcoded in src/lib/newsletter-template.js as "Mama & White Lotus" — which
-- repeated the "Mama / REYKJAVÍK" masthead sitting directly above it. Both are
-- now per-draft editable fields, edited on /newsletters/[draftId].
--
-- NULL falls back to the renderer defaults ("THIS WEEK" / "@White Lotus").
-- An empty string in header_title hides that line entirely.
--
-- Applied to production 2026-07-29.

ALTER TABLE public.newsletter_drafts
  ADD COLUMN IF NOT EXISTS header_kicker text,
  ADD COLUMN IF NOT EXISTS header_title text;

COMMENT ON COLUMN public.newsletter_drafts.header_kicker IS
  'Small orange all-caps line above the title, e.g. THIS WEEK. NULL = renderer default.';
COMMENT ON COLUMN public.newsletter_drafts.header_title IS
  'Large serif italic line under the kicker, e.g. @White Lotus. Empty string hides the line. NULL = renderer default.';
