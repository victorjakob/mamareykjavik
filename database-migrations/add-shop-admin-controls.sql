-- ─────────────────────────────────────────────────────────────────
-- Inline shop admin controls
--
-- Adds visibility / sold-out / featured flags so admins can manage
-- the shop directly from /shop without leaving the page.
--
-- Columns are nullable-with-default-false so existing rows are
-- unaffected (everything stays visible, nothing is sold-out).
-- ─────────────────────────────────────────────────────────────────

-- Products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_hidden  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sold_out   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Categories
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

-- Helpful indexes for the public shop query
CREATE INDEX IF NOT EXISTS idx_products_is_hidden   ON products  (is_hidden);
CREATE INDEX IF NOT EXISTS idx_categories_is_hidden ON categories (is_hidden);

-- ─────────────────────────────────────────────────────────────────
-- "Uncategorized" fallback category
--
-- When admin deletes a category we re-parent its products here
-- rather than orphaning them. Marked hidden so it never appears
-- on the public shop.
-- ─────────────────────────────────────────────────────────────────
INSERT INTO categories (name, slug, description, image, "order", is_hidden)
SELECT
  'Uncategorized',
  'uncategorized',
  'Internal fallback. Products land here when their category is deleted.',
  '/mamaimg/mamalogo.png',
  9999,
  true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'uncategorized');
