-- RLS stage 2 — apply ONLY AFTER the matching mama.is code is deployed
-- (the code moves every browser read/write of these tables to server routes).
--
-- Private: RLS on, no policies → the public key gets nothing; the server's
-- service role is unaffected.
do $$
declare t text;
begin
  foreach t in array array[
    'users','tickets','orders','order_items','carts','cart_items','meal_cards',
    'event-payments','events','event_series','ticket_variants','tours',
    'private_session_practitioners'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Public catalogue: anyone may READ, nobody may write with the public key.
alter table public.categories enable row level security;
alter table public.products   enable row level security;
drop policy if exists "Public read categories" on public.categories;
drop policy if exists "Public read products"   on public.products;
create policy "Public read categories" on public.categories for select to anon, authenticated using (true);
create policy "Public read products"   on public.products   for select to anon, authenticated using (true);

-- Rollback (instant), per table:
--   alter table public.<table> disable row level security;
