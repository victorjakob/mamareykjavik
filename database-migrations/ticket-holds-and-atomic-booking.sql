-- Ticket holds + atomic booking (2026-09-26)
--
-- 1. tickets.hold_expires_at — an online checkout holds its seats for a few
--    minutes while the buyer is on the payment page. Expired holds free up.
-- 2. tickets.price_breakdown — exactly how the server priced the order
--    (standard / early bird / sliding scale / variant, promo, discount, total).
-- 3. reserve_tickets()  — lock the event row, count confirmed seats + live
--    holds, insert the ticket only if it fits. No two buyers can take the
--    last seat.
-- 4. confirm_ticket_payment() — idempotent payment confirmation: a repeated
--    gateway callback is a no-op; the amount must match what we charged; a
--    payment that lands after its hold expired on a full event is still
--    confirmed (the customer paid) and reported as oversold.
--
-- Additive only. Both functions are callable by service_role only.

alter table public.tickets add column if not exists hold_expires_at timestamptz;
alter table public.tickets add column if not exists price_breakdown jsonb;
create index if not exists tickets_event_id_status_idx on public.tickets (event_id, status);
create index if not exists tickets_order_id_idx on public.tickets (order_id);

create or replace function public.tickets_seats_taken(p_event_id bigint, p_exclude_ticket_id bigint default null)
returns integer
language sql
stable
set search_path = public
as $$
  select coalesce(sum(quantity), 0)::int
  from tickets
  where event_id = p_event_id
    and (p_exclude_ticket_id is null or id <> p_exclude_ticket_id)
    and (
      status in ('paid', 'door', 'free', 'cash', 'card', 'transfer')
      or (status = 'pending' and hold_expires_at > now())
    );
$$;

create or replace function public.reserve_tickets(
  p_event_id bigint,
  p_ticket jsonb,
  p_hold_minutes integer default 10
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event   record;
  v_qty     integer := (p_ticket->>'quantity')::int;
  v_status  text    := p_ticket->>'status';
  v_taken   integer;
  v_row     tickets;
begin
  if v_qty is null or v_qty < 1 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_quantity');
  end if;
  if v_status not in ('pending', 'door', 'free') then
    return jsonb_build_object('ok', false, 'reason', 'invalid_status');
  end if;

  select id, capacity, sold_out into v_event
  from events where id = p_event_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'event_not_found');
  end if;

  if v_event.sold_out then
    return jsonb_build_object('ok', false, 'reason', 'sold_out', 'remaining', 0);
  end if;

  if coalesce(v_event.capacity, 0) > 0 then
    v_taken := tickets_seats_taken(p_event_id);
    if v_taken + v_qty > v_event.capacity then
      return jsonb_build_object(
        'ok', false,
        'reason', 'sold_out',
        'remaining', greatest(v_event.capacity - v_taken, 0)
      );
    end if;
  end if;

  insert into tickets (
    order_id, event_id, status, buyer_email, buyer_name, quantity,
    price, total_price, ticket_variant_id, variant_name, event_coupon,
    subscribe_to_newsletter, price_breakdown, hold_expires_at
  ) values (
    p_ticket->>'order_id',
    p_event_id,
    v_status,
    p_ticket->>'buyer_email',
    p_ticket->>'buyer_name',
    v_qty,
    (p_ticket->>'price')::int,
    (p_ticket->>'total_price')::int,
    nullif(p_ticket->>'ticket_variant_id', '')::uuid,
    p_ticket->>'variant_name',
    p_ticket->>'event_coupon',
    coalesce((p_ticket->>'subscribe_to_newsletter')::boolean, false),
    p_ticket->'price_breakdown',
    case when v_status = 'pending'
         then now() + make_interval(mins => greatest(p_hold_minutes, 1))
    end
  )
  returning * into v_row;

  return jsonb_build_object('ok', true, 'ticket', to_jsonb(v_row));
end;
$$;

create or replace function public.confirm_ticket_payment(
  p_order_id text,
  p_amount numeric,
  p_transaction_id text,
  p_payload jsonb,
  p_buyer_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_t        tickets;
  v_capacity integer;
  v_oversold boolean := false;
begin
  select * into v_t from tickets where order_id = p_order_id for update;

  if not found then
    return jsonb_build_object('result', 'not_found');
  end if;

  if v_t.status = 'paid' then
    return jsonb_build_object('result', 'already_paid', 'ticket_id', v_t.id);
  end if;

  if p_amount is null or v_t.total_price is null or round(p_amount) <> v_t.total_price then
    update tickets set payment_payload = p_payload where id = v_t.id;
    return jsonb_build_object(
      'result', 'amount_mismatch',
      'ticket_id', v_t.id,
      'expected', v_t.total_price,
      'received', p_amount
    );
  end if;

  -- Hold still live → the seats were already reserved for this order.
  -- Hold expired (or legacy row with no hold) → check whether it still fits.
  if v_t.hold_expires_at is null or v_t.hold_expires_at <= now() then
    select capacity into v_capacity from events where id = v_t.event_id for update;
    if coalesce(v_capacity, 0) > 0 then
      v_oversold := tickets_seats_taken(v_t.event_id, v_t.id) + v_t.quantity > v_capacity;
    end if;
  end if;

  update tickets set
    status          = 'paid',
    buyer_email     = coalesce(nullif(p_buyer_email, ''), buyer_email),
    transaction_id  = p_transaction_id,
    payment_payload = p_payload,
    hold_expires_at = null
  where id = v_t.id;

  return jsonb_build_object('result', 'confirmed', 'ticket_id', v_t.id, 'oversold', v_oversold);
end;
$$;

revoke all on function public.tickets_seats_taken(bigint, bigint) from public, anon, authenticated;
revoke all on function public.reserve_tickets(bigint, jsonb, integer) from public, anon, authenticated;
revoke all on function public.confirm_ticket_payment(text, numeric, text, jsonb, text) from public, anon, authenticated;
grant execute on function public.tickets_seats_taken(bigint, bigint) to service_role;
grant execute on function public.reserve_tickets(bigint, jsonb, integer) to service_role;
grant execute on function public.confirm_ticket_payment(text, numeric, text, jsonb, text) to service_role;
