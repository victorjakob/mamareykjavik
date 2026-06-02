-- One-time data fix: normalize selected_dates in vendor applications
-- to the corrected 2026 weekend labels.
--
-- The previous version of the date picker showed wrong day-of-week prefixes
-- (e.g. "Fri June 6" when June 6 is a Saturday). The form has since been
-- corrected (see SUMMER_MARKET_WEEKEND_GROUPS in src/lib/summerMarketPricing.js),
-- and the codebase carries a LEGACY_SUMMER_MARKET_DATE_ALIASES map so the
-- normalizeSummerMarketDates() helper translates legacy values on read.
--
-- This migration rewrites stored rows so they all use the current labels,
-- after which the admin UI, calendar, and email batches no longer need to
-- translate at runtime.
--
-- Already applied to production on 2026-06-02. Safe to re-run: rows that
-- are already normalized are skipped via the WHERE distinct check.

with mapping(legacy, current_label) as (
  values
    ('Fri June 6',  'Fri June 5'),
    ('Sat June 7',  'Sat June 6'),
    ('Sun June 8',  'Sun June 7'),
    ('Fri June 13', 'Fri June 12'),
    ('Sat June 14', 'Sat June 13'),
    ('Sun June 15', 'Sun June 14'),
    ('Fri June 20', 'Fri June 19'),
    ('Sat June 21', 'Sat June 20'),
    ('Sun June 22', 'Sun June 21'),
    ('Fri June 27', 'Fri June 26'),
    ('Sat June 28', 'Sat June 27'),
    ('Sun June 29', 'Sun June 28'),
    ('Fri July 4',  'Fri July 3'),
    ('Sat July 5',  'Sat July 4'),
    ('Sun July 6',  'Sun July 5'),
    ('Fri July 11', 'Fri July 10'),
    ('Sat July 12', 'Sat July 11'),
    ('Sun July 13', 'Sun July 12'),
    ('Fri July 18', 'Fri July 17'),
    ('Sat July 19', 'Sat July 18'),
    ('Sun July 20', 'Sun July 19'),
    ('Fri July 25', 'Fri July 24'),
    ('Sat July 26', 'Sat July 25'),
    ('Sun July 27', 'Sun July 26')
),
exploded as (
  select
    a.id,
    u.ord,
    coalesce(m.current_label, u.d) as new_d
  from public.summer_market_vendor_applications a
  cross join lateral unnest(a.selected_dates) with ordinality as u(d, ord)
  left join mapping m on m.legacy = u.d
),
deduped as (
  -- For each (application, normalized_date), keep the earliest position
  -- so the resulting array preserves the vendor's original order.
  select distinct on (id, new_d) id, new_d, ord
  from exploded
  order by id, new_d, ord
),
new_arrays as (
  select id, array_agg(new_d order by ord) as new_dates
  from deduped
  group by id
)
update public.summer_market_vendor_applications a
set selected_dates = na.new_dates
from new_arrays na
where a.id = na.id
  and a.selected_dates::text is distinct from na.new_dates::text;
